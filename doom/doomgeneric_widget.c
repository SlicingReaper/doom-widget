// doomgeneric platform layer for the DOOM//TERM Übersicht widget (wasm32-wasi reactor).
// The JS host calls dw_init() once, then dw_tick() from requestAnimationFrame, and feeds keys
// with dw_key(pressed, doomkey). The 320x200 XRGB frame is read from dw_screen().
#include "doomkeys.h"
#include "m_argv.h"
#include "doomgeneric.h"
#include <stdint.h>

__attribute__((import_module("env"), import_name("js_ticks"))) uint32_t js_ticks(void);

#define KQ 64
static unsigned short kq[KQ];
static unsigned int kw = 0, kr = 0;

void DG_Init(void) {}
void DG_DrawFrame(void) {}
void DG_SleepMs(uint32_t ms) { (void)ms; }   // never block: the JS loop paces the ticks
uint32_t DG_GetTicksMs(void) { return js_ticks(); }
void DG_SetWindowTitle(const char *t) { (void)t; }

int DG_GetKey(int *pressed, unsigned char *key) {
  if (kr == kw) return 0;
  unsigned short d = kq[kr]; kr = (kr + 1) % KQ;
  *pressed = d >> 8; *key = d & 0xFF;
  return 1;
}

__attribute__((export_name("dw_key"))) void dw_key(int pressed, int key) {
  kq[kw] = (unsigned short)(((pressed ? 1 : 0) << 8) | (key & 0xFF));
  kw = (kw + 1) % KQ;
  if (kw == kr) kr = (kr + 1) % KQ;   // drop the oldest when full
}

static char *argv_[] = { "doom", "-iwad", "doom1.wad", 0 };

__attribute__((export_name("dw_init"))) void dw_init(void) { doomgeneric_Create(3, argv_); }
__attribute__((export_name("dw_tick"))) void dw_tick(void) { doomgeneric_Tick(); }
__attribute__((export_name("dw_screen"))) uint32_t dw_screen(void) { return (uint32_t)(uintptr_t)DG_ScreenBuffer; }
__attribute__((export_name("dw_w"))) int dw_w(void) { return DOOMGENERIC_RESX; }
__attribute__((export_name("dw_h"))) int dw_h(void) { return DOOMGENERIC_RESY; }
int system(const char *c) { (void)c; return -1; }
