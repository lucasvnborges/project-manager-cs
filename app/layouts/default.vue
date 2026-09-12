<script setup lang="ts">
const route = useRoute()

const searchOpen = ref(false)
const isSearchPage = computed(() => route.path === '/search')
const showSearchBar = computed(() => searchOpen.value || isSearchPage.value)
const currentQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

watch(isSearchPage, (onSearchPage) => {
  if (onSearchPage) searchOpen.value = false
})
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-canvas">
    <div class="relative z-40 h-16 shrink-0">
      <Transition name="fade-chrome">
        <SearchBar
          v-if="showSearchBar"
          key="search"
          :initial-query="currentQuery"
          :autofocus="searchOpen"
          :enable-history="searchOpen"
          @close="searchOpen = false"
        />
        <AppHeader v-else key="header" @open-search="searchOpen = true" />
      </Transition>
    </div>

    <main class="relative min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-10 sm:px-6">
      <slot />
    </main>
  </div>
</template>
