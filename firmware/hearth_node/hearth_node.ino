// HEARTH Home node: two-color (yellow/blue) 0.96" OLED screen plus outage logging that needs no battery.
// The screen layout below is unchanged from node_screen.ino; only the logging at the bottom is new.
// Yellow strip: time, date, battery. Blue: big indoor temperature + 16-minute graph.
#include <Wire.h>
#include <RTClib.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>

// Outage log records (declared first so the Arduino-generated prototypes can see them).
struct LastSeen { uint32_t t; int16_t temp10; };           // temp10 = deg F * 10, -1000 = no probe
struct OutageEvent { uint32_t start, end; int16_t tStart10, tEnd10; };

#define PIN_PROBE 33
#define PIN_VBAT A13            // battery voltage / 2 (built into the Feather)

// ===== METRIC-Grid screen layout =====
// Two-color 128x64 OLED: rows 0-15 show yellow, rows 16-63 show blue.
// Yellow strip: time, date, battery. Blue area: big temperature + full-width graph.
#include <Fonts/FreeSansBold18pt7b.h>
#include <Fonts/FreeSansBold9pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <Fonts/Org_01.h>

#define UI_W 128
#define UI_H 64
#define UI_HIST 96          // graph points (one every 10 s = 16 minutes)

struct UiState {
  int hour, minute, second, month, day, dow;
  float tempF;            // NAN if probe missing
  float hist[UI_HIST];
  int histCount;
  float delta;            // unused on this layout
  float vbat;             // volts
  uint32_t frame;         // animation counter
};

static int uiTextW(Adafruit_GFX& g, const char* s, const GFXfont* f) {
  int16_t x1, y1; uint16_t w, h;
  g.setFont(f);
  g.getTextBounds(s, 0, 0, &x1, &y1, &w, &h);
  return (int)w + x1;
}
static void uiText(Adafruit_GFX& g, const char* s, int x, int y, const GFXfont* f) {
  g.setFont(f); g.setCursor(x, y); g.print(s);
}

void drawUI(Adafruit_GFX& g, const UiState& s) {
  static const char* mons[] = {"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"};
  g.setTextWrap(false);
  g.setTextColor(1);

  // ---------- YELLOW STRIP (rows 0-15) ----------
  int h12 = s.hour % 12; if (h12 == 0) h12 = 12;
  char t[8];
  snprintf(t, sizeof t, "%d:%02d", h12, s.minute);
  uiText(g, t, 0, 13, &FreeSansBold9pt7b);                         // time
  int tw = uiTextW(g, t, &FreeSansBold9pt7b);
  uiText(g, s.hour < 12 ? "AM" : "PM", tw + 3, 13, &Org_01);      // AM/PM

  int pct = (int)((s.vbat - 3.3f) / (4.2f - 3.3f) * 100);
  if (pct < 0) pct = 0; if (pct > 100) pct = 100;
  g.drawRoundRect(107, 4, 18, 8, 2, 1);                             // battery
  g.fillRect(125, 6, 2, 4, 1);
  g.fillRect(109, 6, (14 * pct) / 100, 4, 1);

  char dt[8];
  snprintf(dt, sizeof dt, "%s %d", mons[s.month - 1], s.day);
  uiText(g, dt, 102 - uiTextW(g, dt, &Org_01), 11, &Org_01);       // date

  // ---------- BLUE AREA (rows 17-63) ----------
  if (isnan(s.tempF)) {
    const char* m = "NO PROBE";
    uiText(g, m, (UI_W - uiTextW(g, m, &FreeSansBold9pt7b)) / 2, 40, &FreeSansBold9pt7b);
  } else {
    char tb[8];
    snprintf(tb, sizeof tb, "%.1f", s.tempF);
    int w = uiTextW(g, tb, &FreeSansBold18pt7b);
    int x = (UI_W - (w + 14)) / 2;                                   // center number + degree F
    uiText(g, tb, x, 45, &FreeSansBold18pt7b);
    g.drawCircle(x + w + 4, 23, 2, 1);                               // degree mark
    uiText(g, "F", x + w + 8, 33, &FreeSans9pt7b);
  }

  // full-width graph, rows 51-62; spreads across the screen from the first readings
  const int gx0 = 0, gx1 = 123, gy0 = 51, gy1 = 61;
  if (s.histCount < 2) {
    for (int x = gx0; x <= gx1; x += 3) g.drawPixel(x, (gy0 + gy1) / 2, 1);   // placeholder line
  } else {
    float lo = 1e9, hi = -1e9;
    for (int i = 0; i < s.histCount; i++) { if (s.hist[i] < lo) lo = s.hist[i]; if (s.hist[i] > hi) hi = s.hist[i]; }
    if (hi - lo < 1.0f) { float m = (hi + lo) / 2; lo = m - 0.5f; hi = m + 0.5f; }
    int px = 0, py = 0;
    for (int i = 0; i < s.histCount; i++) {
      int x = gx0 + i * (gx1 - gx0) / (s.histCount - 1);
      int y = gy1 - (int)lroundf((s.hist[i] - lo) / (hi - lo) * (gy1 - gy0));
      if (i) g.drawLine(px, py, x, y, 1);
      px = x; py = y;
    }
    if ((s.frame / 8) % 2) g.drawCircle(px, py, 2, 1);               // pulsing "now" dot
    g.fillCircle(px, py, 1, 1);
  }
}
// ===== end screen layout =====

// ===== Outage log (no battery needed) =====
// The ESP32 loses power in an outage, but the DS3231 keeps time on its coin cell. Every minute we save
// "last seen" (time + temperature) to flash. On the next boot, a gap of more than OUTAGE_GAP_S between
// last-seen and the clock's "now" is an outage: start = last seen, end = now.
//
// Flash wear: ESP32 NVS is wear-levelled (entries are appended and pages recycled). One 6-byte write per
// minute (~525k a year) and one 8-byte reading per 5 minutes is far below the endurance of the default
// 20 KB NVS partition. Readings are a 24 h ring of single entries (not one large blob) so each save
// touches one small entry. The newest 20 outage events are kept.
#define OUTAGE_GAP_S   180          // longer than 3 minutes dark = an outage
#define MAX_OUTAGE_S   (30UL * 86400UL)
#define EVENT_SLOTS    20
#define READING_SLOTS  288          // 24 h at one reading per 5 minutes
#define READING_EVERY  300
#define DEVICE_NAME    "Living room"


Preferences prefs;
OneWire ow(PIN_PROBE);
DallasTemperature probe(&ow);
RTC_DS3231 rtc;
Adafruit_SSD1306 display(UI_W, UI_H, &Wire, -1);
UiState st;

const uint32_t HIST_MS = 10000;   // one graph point every 10 s
bool converting = false, dimmed = false;
uint32_t convStart = 0, lastTempRead = 0, lastHist = 0, lastVbat = 0, lastSerial = 0;

bool clockTrusted = false;
bool pendingEvent = false;        // an outage was detected at boot; waiting for the first temperature
OutageEvent pending;
uint32_t bootMs = 0, lastMinuteLogged = 0, lastReadingSlot = 0;

static int16_t toTemp10(float f) { return isnan(f) ? -1000 : (int16_t)lroundf(f * 10.0f); }

static void saveLastSeen(uint32_t t, float tempF) {
  LastSeen s = {t, toTemp10(tempF)};
  prefs.putBytes("last", &s, sizeof s);
}
static void saveReading(uint32_t t, float tempF) {
  if (isnan(tempF)) return;
  uint32_t n = prefs.getUInt("rn", 0);
  char key[8]; snprintf(key, sizeof key, "r%u", (unsigned)(n % READING_SLOTS));
  uint64_t packed = ((uint64_t)t << 16) | (uint16_t)(toTemp10(tempF) + 1000);
  prefs.putULong64(key, packed);
  prefs.putUInt("rn", n + 1);
}
static void saveEvent(const OutageEvent& e) {
  uint32_t n = prefs.getUInt("en", 0);
  char key[8]; snprintf(key, sizeof key, "e%u", (unsigned)(n % EVENT_SLOTS));
  prefs.putBytes(key, &e, sizeof e);
  prefs.putUInt("en", n + 1);
}

// Compare saved "last seen" with the clock. Called once from setup().
static void detectOutageAtBoot(uint32_t now) {
  LastSeen last;
  if (!clockTrusted || prefs.getBytes("last", &last, sizeof last) != sizeof last) return;
  if (last.t == 0 || now <= last.t) return;
  uint32_t gap = now - last.t;
  if (gap <= OUTAGE_GAP_S || gap > MAX_OUTAGE_S) return;
  pending = {last.t, now, last.temp10, -1000};   // end temperature is filled in by the first reading
  pendingEvent = true;
}
static void commitPendingEvent(float firstTempF) {
  pending.tEnd10 = toTemp10(firstTempF);
  saveEvent(pending);
  pendingEvent = false;
}

// EXPORT: one JSON object per line, read by scripts/device_export.py.
static void exportLog() {
  uint64_t mac = ESP.getEfuseMac();
  Serial.printf("{\"type\":\"device\",\"id\":\"hearth-%04x%08x\",\"name\":\"%s\"}\n",
                (unsigned)(mac >> 32), (unsigned)mac, DEVICE_NAME);
  uint32_t en = prefs.getUInt("en", 0), count = en < EVENT_SLOTS ? en : EVENT_SLOTS;
  for (uint32_t i = 0; i < count; i++) {
    OutageEvent e; char key[8];
    snprintf(key, sizeof key, "e%u", (unsigned)((en - count + i) % EVENT_SLOTS));
    if (prefs.getBytes(key, &e, sizeof e) != sizeof e) continue;
    Serial.printf("{\"type\":\"event\",\"start\":%u,\"end\":%u,\"temp_start\":%.1f,\"temp_end\":%.1f}\n",
                  (unsigned)e.start, (unsigned)e.end, e.tStart10 / 10.0f, e.tEnd10 / 10.0f);
  }
  uint32_t rn = prefs.getUInt("rn", 0), rcount = rn < READING_SLOTS ? rn : READING_SLOTS;
  for (uint32_t i = 0; i < rcount; i++) {
    char key[8]; snprintf(key, sizeof key, "r%u", (unsigned)((rn - rcount + i) % READING_SLOTS));
    uint64_t packed = prefs.getULong64(key, 0);
    if (!packed) continue;
    Serial.printf("{\"type\":\"reading\",\"t\":%u,\"temp\":%.1f}\n",
                  (unsigned)(packed >> 16), (((int)(packed & 0xFFFF)) - 1000) / 10.0f);
  }
  Serial.println("{\"type\":\"end\"}");
}
static void handleSerial() {
  static String line;
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      line.trim();
      if (line.equalsIgnoreCase("EXPORT")) exportLog();
      line = "";
    } else if (line.length() < 32) line += c;
  }
}
// ===== end outage log =====

void setup() {
  Serial.begin(115200);
  delay(500);
#ifdef NEOPIXEL_I2C_POWER
  pinMode(NEOPIXEL_I2C_POWER, OUTPUT);
  digitalWrite(NEOPIXEL_I2C_POWER, HIGH);
#endif
  Wire.begin();
  analogSetPinAttenuation(PIN_VBAT, ADC_11db);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) Serial.println("Screen NOT found");
  if (!rtc.begin()) Serial.println("Clock NOT found");
  // A dead coin cell makes the clock untrustworthy: reset it, and skip outage detection this boot.
  clockTrusted = !rtc.lostPower();
  if (rtc.lostPower()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  prefs.begin("hearth", false);
  probe.begin();
  probe.setWaitForConversion(false);
  memset(&st, 0, sizeof st);
  st.tempF = NAN;
  st.delta = NAN;
  st.vbat = analogReadMilliVolts(PIN_VBAT) * 2 / 1000.0f;
  uint32_t now = rtc.now().unixtime();
  detectOutageAtBoot(now);
  lastMinuteLogged = now / 60;
  lastReadingSlot = now / READING_EVERY;
  bootMs = millis();
}

void loop() {
  uint32_t ms = millis();

  // temperature: non-blocking read every ~2 s
  if (!converting && ms - lastTempRead >= 2000) { probe.requestTemperatures(); convStart = ms; converting = true; }
  if (converting && ms - convStart >= 800) {
    float c = probe.getTempCByIndex(0);
    st.tempF = (c == DEVICE_DISCONNECTED_C) ? NAN : c * 9.0f / 5.0f + 32.0f;
    converting = false; lastTempRead = ms;
    if (pendingEvent && !isnan(st.tempF)) commitPendingEvent(st.tempF);
  }
  if (pendingEvent && ms - bootMs > 15000) commitPendingEvent(NAN);   // probe missing: keep the outage, no end temperature
  if (!isnan(st.tempF) && (st.histCount == 0 || ms - lastHist >= HIST_MS)) {
    if (st.histCount == UI_HIST) { memmove(st.hist, st.hist + 1, sizeof(float) * (UI_HIST - 1)); st.histCount--; }
    st.hist[st.histCount++] = st.tempF;
    lastHist = ms;
  }
  if (ms - lastVbat >= 5000) { st.vbat = analogReadMilliVolts(PIN_VBAT) * 2 / 1000.0f; lastVbat = ms; }

  DateTime n = rtc.now();
  st.hour = n.hour(); st.minute = n.minute(); st.second = n.second();
  st.month = n.month(); st.day = n.day(); st.dow = n.dayOfTheWeek();

  // every minute: remember we were alive; every 5 minutes: add a reading to the 24 h ring
  uint32_t nowS = n.unixtime();
  if (nowS / 60 != lastMinuteLogged && !pendingEvent) {
    lastMinuteLogged = nowS / 60;
    saveLastSeen(nowS, st.tempF);
    if (nowS / READING_EVERY != lastReadingSlot) { lastReadingSlot = nowS / READING_EVERY; saveReading(nowS, st.tempF); }
  }
  handleSerial();

  bool night = st.hour >= 22 || st.hour < 7;      // dim the screen at night
  if (night != dimmed) { display.dim(night); dimmed = night; }

  display.clearDisplay();
  drawUI(display, st);
  display.display();
  st.frame++;

  if (ms - lastSerial >= 10000) {
    int h12 = st.hour % 12; if (h12 == 0) h12 = 12;
    if (isnan(st.tempF)) Serial.printf("%d:%02d %s | probe NOT reading\n", h12, st.minute, st.hour < 12 ? "AM" : "PM");
    else Serial.printf("%d:%02d %s | %.1f F | battery %.2f V\n", h12, st.minute, st.hour < 12 ? "AM" : "PM", st.tempF, st.vbat);
    lastSerial = ms;
  }
  delay(100);
}
