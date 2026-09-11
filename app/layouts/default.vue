<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <AppHeader />

    <main class="flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-6">
      <slot />
    </main>
  </div>
</template>
