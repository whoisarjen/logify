interface Project {
  id: string
  name: string
  createdAt: string
}

interface ProjectState {
  projects: Project[]
  selected: Project | null
  loading: boolean
}

export function useProject() {
  const projectState = useState<ProjectState>('projects', () => ({
    projects: [],
    selected: null,
    loading: false,
  }))

  async function fetchProjects() {
    if (projectState.value.projects.length > 0) return

    projectState.value.loading = true
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const data = await $fetch<{ projects: Project[] }>('/api/projects', { headers })
      projectState.value.projects = data.projects
      if (data.projects.length > 0 && !projectState.value.selected) {
        projectState.value.selected = data.projects[0]
      }
    } catch {
      projectState.value.projects = []
    } finally {
      projectState.value.loading = false
    }
  }

  function selectProject(project: Project) {
    projectState.value.selected = project
  }

  return {
    projects: computed(() => projectState.value.projects),
    selected: computed(() => projectState.value.selected),
    loading: computed(() => projectState.value.loading),
    fetchProjects,
    selectProject,
  }
}
