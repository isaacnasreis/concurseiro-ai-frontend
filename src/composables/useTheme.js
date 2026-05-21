import { ref, watch, onMounted } from 'vue';

export function useTheme() {
  const theme = ref('light');

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.value = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark';
    }
  });

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, { immediate: true });

  return {
    theme,
    toggleTheme
  };
}
