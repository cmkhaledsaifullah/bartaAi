export default class E2EReporter {
  constructor() {
    this.hasStarted = false
    this.totalTests = 0
    this.passedTests = 0
    this.failedTests = 0
  }

  onCollected() {
    if (!this.hasStarted) {
      console.log('\n')
      console.log('E2E Test Results:')
      console.log('='.repeat(70))
      console.log('')
      this.hasStarted = true
    }
  }

  onFinished(files) {
    if (files && files.length > 0) {
      files.forEach(file => {
        this.processTasksRecursively(file.tasks)
      })
      
      console.log('='.repeat(70))
      console.log(`Total: ${this.totalTests} | Passed: ${this.passedTests} | Failed: ${this.failedTests}`)
      console.log('')
    }
  }

  processTasksRecursively(tasks) {
    tasks.forEach(task => {
      if (task.type === 'test' && task.result) {
        this.totalTests++
        
        if (task.result.state === 'pass') {
          this.passedTests++
          const testName = this.getFullTestName(task)
          console.log(`✓ ${testName}`)
          console.log(`Status: Succeed`)
          console.log('')
        } else if (task.result.state === 'fail') {
          this.failedTests++
          const testName = this.getFullTestName(task)
          console.log(`✗ ${testName}`)
          
          const errorMessage = task.result?.errors?.[0]?.message || 'Test failed'
          const cleanError = this.cleanErrorMessage(errorMessage)
          console.log(`Status: ${cleanError}`)
          console.log('')
        }
      }
      
      if (task.tasks && task.tasks.length > 0) {
        this.processTasksRecursively(task.tasks)
      }
    })
  }

  getFullTestName(task) {
    const names = []
    let current = task

    while (current) {
      if (current.name) {
        names.unshift(current.name)
      }
      current = current.suite
    }

    // Remove the file name from the beginning if present
    if (names[0] && names[0].includes('.test.ts')) {
      names.shift()
    }

    return names.join(' > ')
  }

  cleanErrorMessage(message) {
    // Remove ANSI color codes
     
    const withoutAnsi = message.replace(/\u001b\[\d+m/g, '')
    
    // Get the first line or first 150 characters
    const lines = withoutAnsi.split('\n')
    const firstMeaningfulLine = lines.find(line => line.trim().length > 0) || lines[0]
    
    if (firstMeaningfulLine.length > 150) {
      return firstMeaningfulLine.substring(0, 150) + '...'
    }
    
    return firstMeaningfulLine
  }
}
