<template>
  <div class="flex items-center gap-2">
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="shrink-0"
    >
      <!-- Shield background -->
      <path
        d="M20 2L4 8V18C4 28.5 10.84 38.26 20 40C29.16 38.26 36 28.5 36 18V8L20 2Z"
        fill="var(--ui-primary)"
        fill-opacity="0.15"
        stroke="var(--ui-primary)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- Flag icon inside shield -->
      <path
        d="M14 12V28M14 12L26 16L14 20"
        stroke="var(--ui-primary)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span class="font-bold text-xl tracking-tight text-[var(--ui-text-highlighted)]">
      NKCTF
    </span>
  </div>
</template>
