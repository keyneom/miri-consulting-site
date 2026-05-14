export function rewriteAssetPaths(html: string): string {
  const rewritten = html
    .replaceAll('local-brand-logos/', '/assets/logos/local/')
    .replaceAll('assets/team/', '/assets/team/')
    .replaceAll('assets/testimonials/', '/assets/testimonials/')
    .replaceAll(
      'cdn.prod.website-files.com/64f363b4ba0fc1362362824f/css/',
      '/vendor/webflow/css/',
    )
    .replaceAll(
      'cdn.prod.website-files.com/64f363b4ba0fc1362362824f/js/',
      '/vendor/webflow/js/',
    )
    .replaceAll(
      'cdn.prod.website-files.com/64f363b4ba0fc1362362824f/',
      '/vendor/webflow/assets/',
    )
    .replaceAll(
      'cdn.prod.website-files.com/64f363b4ba0fc1362362824f%252F652d31f3dc22d7b4ee708e44%252F67cf7e497e5209310062b97c%252Fclarity_script-1.4.7.js',
      '/vendor/tags/clarity_script-1.4.7.js',
    )
    .replaceAll(
      'cdn.prod.website-files.com/64f363b4ba0fc1362362824f%252F66ba5a08efe71070f98dd10a%252F67cf65c4e96f6939f5bc9bfd%252Fn3phmjqq-1.1.1.js',
      '/vendor/tags/n3phmjqq-1.1.1.js',
    )
    .replaceAll(
      'ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
      '/vendor/webfont/webfont.js',
    )
    .replaceAll(
      'd3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js%3Fsite=64f363b4ba0fc1362362824f',
      '/vendor/jquery/jquery-3.5.1.min.js',
    )
    .replaceAll(
      'cdn-cookieyes.com/client_data/a9444bde0e91feb16b7f6557/script.js',
      '/vendor/cookieyes/script.js',
    )
    .replaceAll(
      'cdn.jsdelivr.net/npm/@finsweet/attributes-modal@1/modal.js',
      '/vendor/finsweet/modal.js',
    )
    .replaceAll(
      'haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/tvAAsIKEswP0uufI_5zRB4CSZhM',
      '/vendor/tags/first-party/tvAAsIKEswP0uufI_5zRB4CSZhM',
    )
    .replaceAll('%402x', '@2x');

  return rewritten;
}
