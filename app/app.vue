<template>
  <div class="h-full overflow-hidden">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page' }" />
    </NuxtLayout>
  </div>
</template>
