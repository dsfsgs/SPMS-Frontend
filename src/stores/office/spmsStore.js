// stores/office/spmsStore.js

import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    structure: [],
    loading: false,
    error: null,
    officeName: '',
    targetPeriods: [],
    selectedSemester: null,
    selectedYear: null,
    completionMap: {},
    // Head position titles for auto-detection
    headPositionTitles: [
      'office head',
      'sub-office head',
      'group head',
      'division head',
      'section head',
      'unit head',
    ],
  }),

  getters: {
    /**
     * Get the latest target period based on year and semester
     */
    getLatestPeriod: (state) => {
      if (!state.targetPeriods || state.targetPeriods.length === 0) return null

      const semesterOrder = {
        'January-June': 1,
        'July-December': 2,
      }

      // Sort by year (descending) then semester (descending)
      const sorted = [...state.targetPeriods].sort((a, b) => {
        const yearDiff = parseInt(b.year) - parseInt(a.year)
        if (yearDiff !== 0) return yearDiff
        return (semesterOrder[b.semester] || 0) - (semesterOrder[a.semester] || 0)
      })

      return sorted[0] || null
    },

    /**
     * Get unique years from target periods, sorted descending
     */
    getAvailableYears: (state) => {
      if (!state.targetPeriods || state.targetPeriods.length === 0) return []

      const years = new Set()
      state.targetPeriods.forEach((period) => {
        if (period.year) years.add(period.year)
      })

      // Sort descending (newest first)
      return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
    },

    /**
     * Get unique semesters for the selected year
     */
    getAvailableSemesters: (state) => {
      if (!state.selectedYear || !state.targetPeriods || state.targetPeriods.length === 0) {
        return []
      }

      const semesters = state.targetPeriods
        .filter((period) => period.year === state.selectedYear)
        .map((period) => period.semester)
        .filter((sem, idx, arr) => arr.indexOf(sem) === idx) // Remove duplicates

      // Sort: January-June first, then July-December
      const order = { 'January-June': 1, 'July-December': 2 }
      return semesters.sort((a, b) => (order[a] || 0) - (order[b] || 0))
    },

    /**
     * Get current target period object
     */
    getCurrentTargetPeriod: (state) => {
      if (!state.selectedSemester || !state.selectedYear) return null
      return {
        semester: state.selectedSemester,
        year: state.selectedYear,
      }
    },

    /**
     * Get node completion status
     */
    getNodeCompletion: (state) => (nodeId) => {
      const completion = state.completionMap[nodeId]
      if (!completion) {
        return {
          completed: 0,
          total: 0,
          isCompleted: false,
          ratio: '0/0',
          isLeafNode: false,
        }
      }
      return {
        completed: completion.completed,
        total: completion.total,
        isCompleted: completion.completed === completion.total && completion.total > 0,
        ratio: `${completion.completed}/${completion.total}`,
        isLeafNode: completion.isLeafNode || false,
      }
    },

    /**
     * Get all employees with head positions in the organization
     */
    getHeadEmployees: (state) => {
      const headEmployees = []

      const traverseForHeads = (nodes) => {
        if (!nodes) return
        for (const node of nodes) {
          if (node.type === 'employee') {
            const jobTitle = node.employeeData?.job_title || node.jobTitle || ''
            const lowerTitle = jobTitle.toLowerCase()
            if (state.headPositionTitles.some((title) => lowerTitle.includes(title))) {
              headEmployees.push(node)
            }
          }
          if (node.children) {
            traverseForHeads(node.children)
          }
        }
      }

      traverseForHeads(state.structure)
      return headEmployees
    },
  },

  actions: {
    // =========================================================================
    // HEAD POSITION DETECTION
    // =========================================================================

    /**
     * Check if an employee has a head position
     */
    isHeadPosition(employee) {
      if (!employee) return false
      const jobTitle = employee.employeeData?.job_title || employee.jobTitle || ''
      const lowerTitle = jobTitle.toLowerCase()
      return this.headPositionTitles.some((title) => lowerTitle.includes(title))
    },

    // =========================================================================
    // OFFICE HEAD VALIDATION
    // =========================================================================

    /**
     * Find the Office Head employee at the office (root) level.
     * Identified by job_title === 'Office Head' (case-insensitive).
     * Returns the employee node or null if not found.
     */
    getOfficeHeadEmployee() {
      const officeNode = this.structure?.[0]
      if (!officeNode) return null

      // Only look at direct children of the office node
      const directEmployees = (officeNode.children || []).filter(
        (child) => child.type === 'employee',
      )

      return (
        directEmployees.find((emp) => {
          const jobTitle =
            emp.employeeData?.job_title?.toLowerCase() || emp.jobTitle?.toLowerCase() || ''
          return jobTitle === 'office head'
        }) || null
      )
    },

    /**
     * Returns true if the Office Head employee has has_target_period = true.
     * Returns false if no Office Head exists or their target period is not set.
     */
    isOfficeHeadReady() {
      const officeHead = this.getOfficeHeadEmployee()
      if (!officeHead) return false
      return officeHead.hasTargetPeriod === true
    },

    /**
     * Get all employees with head positions for auto-selection in UWP
     */
    getHeadEmployeesForAutoSelection() {
      const headEmployees = []

      const traverse = (nodes) => {
        if (!nodes) return
        for (const node of nodes) {
          if (node.type === 'employee') {
            const jobTitle = node.employeeData?.job_title || node.jobTitle || ''
            const lowerTitle = jobTitle.toLowerCase()
            if (this.headPositionTitles.some((title) => lowerTitle.includes(title))) {
              headEmployees.push(node.employeeData || node)
            }
          }
          if (node.children) {
            traverse(node.children)
          }
        }
      }

      traverse(this.structure)
      return headEmployees
    },

    // =========================================================================
    // TARGET PERIOD - FIXED VERSION
    // =========================================================================

    /**
     * Fetch target periods from the API
     * Handles the nested response structure: { success, message, data: [...] }
     */
    async fetchListTargetPeriod() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/targetPeriod')

        // Extract data from the nested response structure
        // Response format: { success: true, message: "...", data: [...] }
        let periods = []

        if (response.data?.data && Array.isArray(response.data.data)) {
          periods = response.data.data
        } else if (Array.isArray(response.data)) {
          periods = response.data
        } else if (response.data?.periods && Array.isArray(response.data.periods)) {
          periods = response.data.periods
        } else {
          console.warn('Unexpected response format for target periods:', response.data)
          periods = []
        }

        // Set the periods in state
        this.targetPeriods = periods

        console.log('Target periods loaded successfully:', this.targetPeriods)

        // Auto-select the latest period if available
        if (this.targetPeriods.length > 0) {
          const latestPeriod = this.getLatestPeriod
          if (latestPeriod) {
            // Only update if not already set or if current selection is invalid
            const currentValid = this.targetPeriods.some(
              (p) => p.semester === this.selectedSemester && p.year === this.selectedYear,
            )

            if (!currentValid || !this.selectedSemester || !this.selectedYear) {
              this.selectedSemester = latestPeriod.semester
              this.selectedYear = latestPeriod.year
              console.log('Auto-selected period:', {
                semester: this.selectedSemester,
                year: this.selectedYear,
              })
            }
          }
        } else {
          // No periods available, reset selection
          this.selectedSemester = null
          this.selectedYear = null
          console.warn('No target periods available')
        }

        this.error = null
        return this.targetPeriods
      } catch (error) {
        console.error('Error fetching target periods:', error)
        this.error = error.message || 'Failed to fetch target periods'
        this.targetPeriods = []
        this.selectedSemester = null
        this.selectedYear = null
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Set the current target period and refresh structure
     */
    async setTargetPeriod(semester, year) {
      if (!semester || !year) {
        console.warn('Invalid target period:', { semester, year })
        return
      }

      // Validate that the period exists
      const periodExists = this.targetPeriods.some(
        (p) => p.semester === semester && p.year === year,
      )

      if (!periodExists) {
        console.warn('Target period not found in available periods:', { semester, year })
        // Don't proceed if period doesn't exist
        return
      }

      this.selectedSemester = semester
      this.selectedYear = year

      console.log('Target period set:', { semester, year })

      // Refresh structure with the new period
      await this.fetchStructure()
    },

    /**
     * Fetch structure data for the current target period
     */
    async fetchStructure() {
      if (!this.selectedSemester || !this.selectedYear) {
        console.warn('Cannot fetch structure: No target period selected')
        return
      }

      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const { officeId } = userStore

        if (!officeId) {
          console.warn('No office ID available')
          this.structure = []
          this.completionMap = {}
          return
        }

        // Fetch office structure
        const { data: structureData } = await api.get('spms/office/structure', {
          params: { office_id: officeId },
        })

        // Fetch employees for the selected period
        let employees = []
        try {
          const employeeResponse = await api.get('spms/fetch_employees', {
            params: {
              office_id: officeId,
              semester: this.selectedSemester,
              year: this.selectedYear,
            },
          })

          if (Array.isArray(employeeResponse.data)) {
            employees = employeeResponse.data
          } else if (Array.isArray(employeeResponse.data?.data)) {
            employees = employeeResponse.data.data
          } else if (Array.isArray(employeeResponse.data?.employees)) {
            employees = employeeResponse.data.employees
          }
        } catch (error) {
          console.warn('Failed to fetch employees:', error)
          employees = []
        }

        // Build the structure
        if (structureData?.length) {
          this.officeName = structureData[0].office
          this.structure = this.transformStructure(structureData[0], employees)
          this.calculateCompletionMap(this.structure)
        } else {
          this.structure = []
          this.completionMap = {}
        }

        this.error = null
      } catch (error) {
        console.error('Error fetching structure:', error)
        this.error = error.message || 'Failed to fetch structure'
        this.structure = []
        this.completionMap = {}
      } finally {
        this.loading = false
      }
    },

    /**
     * Alternative fetch method for HR data
     */
    async fetchStructureHR() {
      if (!this.selectedSemester || !this.selectedYear) {
        console.warn('Cannot fetch structure: No target period selected')
        return
      }

      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const { officeId } = userStore

        if (!officeId) {
          console.warn('No office ID available')
          this.structure = []
          this.completionMap = {}
          return
        }

        const { data: structureData } = await api.get('spms/office/structure', {
          params: { office_id: officeId },
        })

        let employees = []
        try {
          const employeeResponse = await api.get('spms/employees-requested', {
            params: {
              office_id: officeId,
              semester: this.selectedSemester,
              year: this.selectedYear,
            },
          })

          if (Array.isArray(employeeResponse.data)) {
            employees = employeeResponse.data
          } else if (Array.isArray(employeeResponse.data?.data)) {
            employees = employeeResponse.data.data
          } else if (Array.isArray(employeeResponse.data?.employees)) {
            employees = employeeResponse.data.employees
          }
        } catch (error) {
          console.warn('Failed to fetch HR employees:', error)
          employees = []
        }

        if (structureData?.length) {
          this.officeName = structureData[0].office
          this.structure = this.transformStructure(structureData[0], employees)
          this.calculateCompletionMap(this.structure)
        } else {
          this.structure = []
          this.completionMap = {}
        }

        this.error = null
      } catch (error) {
        console.error('Error fetching HR structure:', error)
        this.error = error.message || 'Failed to fetch HR structure'
        this.structure = []
        this.completionMap = {}
      } finally {
        this.loading = false
      }
    },

    // =========================================================================
    // TRANSFORM STRUCTURE
    // =========================================================================

    transformStructure(officeData, employees) {
      if (!officeData) return []

      const headRanks = [
        'office-head',
        'office2-head',
        'group-head',
        'division-head',
        'section-head',
        'unit-head',
      ]
      const isHeadByRank = (rank) => rank && headRanks.some((h) => rank.toLowerCase().includes(h))

      const createEmployeeNode = (emp) => {
        let ipcrStatus = ''

        if (Array.isArray(emp.existing_target_period) && emp.existing_target_period.length > 0) {
          ipcrStatus = emp.existing_target_period[0]?.status || 'pending'
        } else if (emp.existing_target_period && typeof emp.existing_target_period === 'object') {
          ipcrStatus = emp.existing_target_period.status || 'pending'
        } else if (emp.ipcr_status) {
          ipcrStatus = emp.ipcr_status
        }

        if (emp.target_period?.status) {
          ipcrStatus = emp.target_period.status
        }

        return {
          id: 'emp_' + emp.id,
          label: emp.name,
          position:
            typeof emp.position === 'object' ? emp.position?.name || 'N/A' : emp.position || 'N/A',
          rank: emp.rank,
          jobTitle: emp.job_title || '',
          ipcrStatus,
          type: 'employee',
          isHead: isHeadByRank(emp.rank) || this.isHeadPosition(emp),
          hasTargetPeriod: emp.has_target_period === true,
          employeeData: emp,
          children: [],
          directCount: 1,
        }
      }

      // Group employees by their lowest-level org unit
      const employeesByLocation = new Map()
      employees.forEach((emp) => {
        let key = ''
        if (emp.unit) key = `unit_${this.slugify(emp.unit)}`
        else if (emp.section) key = `section_${this.slugify(emp.section)}`
        else if (emp.division) key = `division_${this.slugify(emp.division)}`
        else if (emp.group) key = `group_${this.slugify(emp.group)}`
        else if (emp.office2) key = `office2_${this.slugify(emp.office2)}`
        else key = 'office_root'

        if (!employeesByLocation.has(key)) employeesByLocation.set(key, [])
        employeesByLocation.get(key).push(createEmployeeNode(emp))
      })

      const buildUnit = (unitName) => {
        const key = `unit_${this.slugify(unitName)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        return {
          id: key,
          label: unitName,
          type: 'unit',
          children: [...allEmps],
          directCount: countableEmps.length,
        }
      }

      const buildSection = (sectionName, units) => {
        const key = `section_${this.slugify(sectionName)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        const builtUnits = (units || []).map((u) => buildUnit(u))
        const employeesInChildUnits = builtUnits.reduce((sum, u) => sum + u.directCount, 0)
        return {
          id: key,
          label: sectionName,
          type: 'section',
          children: [...allEmps, ...builtUnits],
          directCount: countableEmps.length + employeesInChildUnits,
        }
      }

      const buildDivision = (divisionData) => {
        const key = `division_${this.slugify(divisionData.division)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        const children = [...allEmps]
        let directOrgChildCount = 0

        ;(divisionData.sections || []).forEach((sec) => {
          children.push(buildSection(sec.section, sec.units || []))
          directOrgChildCount++
        })
        ;(divisionData.units_without_section || []).forEach((unit) => {
          children.push(buildUnit(unit))
          directOrgChildCount++
        })

        return {
          id: key,
          label: divisionData.division,
          type: 'division',
          children,
          directCount: countableEmps.length + directOrgChildCount,
        }
      }

      const buildGroup = (groupData) => {
        const children = []

        const addGroupChildren = (target) => {
          let count = 0
          ;(groupData.divisions || []).forEach((div) => {
            target.push(buildDivision(div))
            count++
          })
          ;(groupData.sections_without_division || []).forEach((sec) => {
            target.push(buildSection(sec.section, sec.units || []))
            count++
          })
          ;(groupData.units_without_division || []).forEach((unit) => {
            target.push(buildUnit(unit))
            count++
          })
          return count
        }

        if (groupData.group === null) {
          addGroupChildren(children)
          return children
        }

        const key = `group_${this.slugify(groupData.group)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        children.push(...allEmps)
        const directOrgChildCount = addGroupChildren(children)

        return {
          id: key,
          label: groupData.group,
          type: 'group',
          children,
          directCount: countableEmps.length + directOrgChildCount,
        }
      }

      const buildOffice2 = (office2Data) => {
        const children = []

        const addOffice2Children = (target) => {
          let count = 0
          ;(office2Data.group || []).forEach((grp) => {
            const result = buildGroup(grp)
            if (Array.isArray(result)) {
              target.push(...result)
              count += result.length
            } else {
              target.push(result)
              count++
            }
          })
          return count
        }

        if (office2Data.office2 === null) {
          addOffice2Children(children)
          return children
        }

        const key = `office2_${this.slugify(office2Data.office2)}`
        const allEmps = employeesByLocation.get(key) || []
        const countableEmps = allEmps.filter((emp) => this.shouldCountEmployee(emp))
        children.push(...allEmps)
        const directOrgChildCount = addOffice2Children(children)

        return {
          id: key,
          label: office2Data.office2,
          type: 'office2',
          children,
          directCount: countableEmps.length + directOrgChildCount,
        }
      }

      // Build office root
      const rootEmps = employeesByLocation.get('office_root') || []
      const countableRootEmps = rootEmps.filter((emp) => this.shouldCountEmployee(emp))
      const officeChildren = [...rootEmps]
      let officeDirectOrgChildCount = 0

      ;(officeData.office2 || []).forEach((office2Data) => {
        const result = buildOffice2(office2Data)
        if (Array.isArray(result)) {
          officeChildren.push(...result)
          officeDirectOrgChildCount += result.length
        } else {
          officeChildren.push(result)
          officeDirectOrgChildCount++
        }
      })

      const officeNode = {
        id: 'office_' + this.slugify(officeData.office),
        label: officeData.office,
        type: 'office',
        children: officeChildren,
        directCount: countableRootEmps.length + officeDirectOrgChildCount,
      }

      // Compute leaf flags
      const computeLeafFlags = (node) => {
        if (!node || node.type === 'employee') return
        let hasOrgChild = false
        ;(node.children || []).forEach((child) => {
          computeLeafFlags(child)
          if (child.type !== 'employee') hasOrgChild = true
        })
        node.isLeaf = !hasOrgChild
      }
      computeLeafFlags(officeNode)

      return [officeNode]
    },

    // =========================================================================
    // COMPLETION MAP
    // =========================================================================

    calculateCompletionMap(nodes) {
      const map = {}

      const countEmployees = (node, countFn) => {
        if (!node) return 0
        if (node.type === 'employee') return countFn(node) ? 1 : 0
        return (node.children || []).reduce((sum, child) => sum + countEmployees(child, countFn), 0)
      }

      const processNode = (node) => {
        if (!node) return
        ;(node.children || []).forEach((child) => processNode(child))

        if (node.type === 'employee') {
          const shouldCount = this.shouldCountEmployee(node)
          map[node.id] = {
            completed: shouldCount && node.hasTargetPeriod ? 1 : 0,
            total: shouldCount ? 1 : 0,
            isLeafNode: false,
          }
          return
        }

        if (node.isLeaf) {
          const total = countEmployees(node, (emp) => this.shouldCountEmployee(emp))
          const completed = countEmployees(
            node,
            (emp) => this.shouldCountEmployee(emp) && emp.hasTargetPeriod,
          )
          map[node.id] = { completed, total, isLeafNode: true }
        } else {
          let completedChildren = 0
          let totalDirectItems = 0

          ;(node.children || []).forEach((child) => {
            if (child.type === 'employee') {
              if (this.shouldCountEmployee(child)) {
                totalDirectItems++
                if (child.hasTargetPeriod) completedChildren++
              }
            } else {
              totalDirectItems++
              const childEntry = map[child.id]
              if (childEntry && childEntry.total > 0 && childEntry.completed === childEntry.total) {
                completedChildren++
              }
            }
          })

          map[node.id] = {
            completed: completedChildren,
            total: totalDirectItems,
            isLeafNode: false,
          }
        }
      }

      if (Array.isArray(nodes)) nodes.forEach((n) => processNode(n))
      else if (nodes) processNode(nodes)

      this.completionMap = map
    },

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Check if an employee status should be excluded from counts
     */
    isExcludedStatus(status) {
      if (!status) return false
      return ['CONTRACTUAL', 'HONORARIUM'].includes(status.toUpperCase())
    },

    /**
     * Check if an employee should be counted in the organization
     */
    shouldCountEmployee(employee) {
      if (!employee) return false
      const status = employee.status || employee.employeeData?.status
      return !this.isExcludedStatus(status)
    },

    /**
     * Find a node by ID in the structure
     */
    _findNode(nodeId, nodes = this.structure) {
      if (!nodes) return null

      for (const node of nodes) {
        if (node.id === nodeId) return node
        if (node.children) {
          const found = this._findNode(nodeId, node.children)
          if (found) return found
        }
      }
      return null
    },

    /**
     * Create a URL-friendly slug from text
     */
    slugify(text) {
      if (!text) return ''
      return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
    },

    /**
     * Reset all data (useful for logout or switching offices)
     */
    reset() {
      this.structure = []
      this.loading = false
      this.error = null
      this.officeName = ''
      this.targetPeriods = []
      this.selectedSemester = null
      this.selectedYear = null
      this.completionMap = {}
    },
  },
})
