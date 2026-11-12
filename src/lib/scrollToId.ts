export function scrollToId(id: string, block: ScrollLogicalPosition = 'start'): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block })
}
