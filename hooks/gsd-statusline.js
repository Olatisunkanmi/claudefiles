#!/usr/bin/env node
/**
 * gsd-statusline.js
 * 
 * Hook: StatusLine
 * Purpose: Generate dynamic status line information for Claude Code
 * 
 * Displays current project context, git status, and workflow state.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current 2>/dev/null', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf8' }).trim();
    
    let gitStatus = branch;
    if (status) {
      const lines = status.split('\n').length;
      gitStatus += ` (${lines} changes)`;
    }
    
    return gitStatus;
  } catch {
    return null;
  }
}

function getProjectInfo() {
  try {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);
    
    // Check for package.json
    if (fs.existsSync('package.json')) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.name || projectName;
      } catch {
        return projectName;
      }
    }
    
    return projectName;
  } catch {
    return 'unknown';
  }
}

function main() {
  try {
    const projectInfo = getProjectInfo();
    const gitInfo = getGitInfo();
    
    let status = projectInfo;
    
    if (gitInfo) {
      status += ` [${gitInfo}]`;
    }
    
    // Add timestamp for debugging
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`${status} • ${timestamp}`);
  } catch (error) {
    console.log(`status error • ${new Date().toLocaleTimeString()}`);
  }
}

main();