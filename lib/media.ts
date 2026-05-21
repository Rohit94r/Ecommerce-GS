export function isDataUrl(url: string) {
  return url.startsWith("data:");
}

export function productMediaRoute(productId: string, index: number) {
  return `/api/media/product/${encodeURIComponent(productId)}/${index}`;
}

export function blogMediaRoute(blogId: string, index: number) {
  return `/api/media/blog/${encodeURIComponent(blogId)}/${index}`;
}
