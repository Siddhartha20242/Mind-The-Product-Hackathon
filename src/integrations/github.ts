import { Octokit } from "@octokit/rest";
import { pendoTrack } from "../utils/pendo";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function createIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  labels: string[],
  assignees: string[],
  milestone: number | undefined,
  visitorId: string,
  accountId: string
) {
  const result = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
    assignees,
    milestone,
  });

  // Track successful issue creation
  await pendoTrack("github_issue_created", visitorId, accountId, {
    repoName: `${owner}/${repo}`,
    issueNumber: result.data.number,
    labelCount: labels.length,
    hasAssignee: assignees.length > 0,
    hasMilestone: milestone !== undefined,
  });

  return result.data;
}

export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string,
  body: string,
  draft: boolean,
  reviewers: string[],
  visitorId: string,
  accountId: string
) {
  const result = await octokit.rest.pulls.create({
    owner,
    repo,
    title,
    head,
    base,
    body,
    draft,
  });

  if (reviewers.length > 0) {
    await octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number: result.data.number,
      reviewers,
    });
  }

  // Track successful PR creation
  await pendoTrack("github_pr_created", visitorId, accountId, {
    repoName: `${owner}/${repo}`,
    prNumber: result.data.number,
    baseBranch: base,
    headBranch: head,
    isDraft: draft,
    reviewerCount: reviewers.length,
  });

  return result.data;
}

export async function syncRepository(
  owner: string,
  repo: string,
  syncType: string,
  visitorId: string,
  accountId: string
) {
  const startTime = Date.now();

  const repoData = await octokit.rest.repos.get({ owner, repo });
  const issues = await octokit.rest.issues.listForRepo({ owner, repo, state: "open" });
  const pulls = await octokit.rest.pulls.list({ owner, repo, state: "open" });

  const itemsSynced = issues.data.length + pulls.data.length;
  const syncDuration = Date.now() - startTime;

  // Track successful repo sync
  await pendoTrack("github_repo_synced", visitorId, accountId, {
    repoName: `${owner}/${repo}`,
    syncType,
    itemsSynced,
    syncDuration,
  });

  return { repo: repoData.data, issues: issues.data, pulls: pulls.data };
}
