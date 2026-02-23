export function useReveal() {
  const el = ref<HTMLElement | null>(null)

  onMounted(() => {
    if (!el.value) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el.value)

    onUnmounted(() => observer.disconnect())
  })

  return el
}
