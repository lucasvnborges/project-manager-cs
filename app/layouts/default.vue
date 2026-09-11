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
  <div class="flex min-h-screen flex-col bg-canvas">
    <SearchBar
      v-if="showSearchBar"
      :initial-query="currentQuery"
      :autofocus="searchOpen"
      :enable-history="searchOpen"
      @close="searchOpen = false"
    />
    <AppHeader v-else @open-search="searchOpen = true" />

    <main class="flex-1 px-4 pt-6 pb-10 sm:px-6">
      <slot />
    </main>
  </div>
</template>
