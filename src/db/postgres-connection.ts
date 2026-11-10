export function postgresSsl(connection: string): 'require' | false {
  const url = new URL(connection);
  return ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) && url.searchParams.get('sslmode') === 'disable' ? false : 'require';
}
