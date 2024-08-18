export function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((comp) => decodeURIComponent(comp));
  return decodedComponents.join("/");
}
