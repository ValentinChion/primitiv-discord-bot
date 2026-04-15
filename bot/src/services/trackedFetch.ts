import chalk from "chalk";

let subrequestCount = 0;

export function resetSubrequestCount() {
  subrequestCount = 0;
}

export async function trackedFetch(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  subrequestCount++;
  const method = init?.method ?? "GET";
  const urlStr = url instanceof Request ? url.url : String(url);
  console.log(chalk.magenta(`[Subrequest #${subrequestCount}] ${method} ${urlStr}`));
  return fetch(url as any, init);
}
