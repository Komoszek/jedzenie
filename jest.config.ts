import { getJestProjectsAsync } from "@nx/jest"

const getConfig = async () => ({ projects: await getJestProjectsAsync() })

export default getConfig
