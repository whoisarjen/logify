interface Project {
  id: string
  name: string
  createdAt: string
}

const projectState = reactive<{
  projects: Project[]
  selected: Project | null
  loading: boolean
}>({
  projects: [],
  selected: null,
  loading: false,
})

export function useProject() {
  async function fetchProjects() {
    if (projectState.projects.length > 0) return

    projectState.loading = true
    try {
      const data = await $fetch<{ projects: Project[] }>('/api/projects')
      projectState.projects = data.projects
      if (data.projects.length > 0 && !projectState.selected) {
        projectState.selected = data.projects[0]
      }
    } catch {
      projectState.projects = []
    } finally {
      projectState.loading = false
    }
  }

  function selectProject(project: Project) {
    projectState.selected = project
  }

  return {
    projects: computed(() => projectState.projects),
    selected: computed(() => projectState.selected),
    loading: computed(() => projectState.loading),
    fetchProjects,
    selectProject,
  }
}
