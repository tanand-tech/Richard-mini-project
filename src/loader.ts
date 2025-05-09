export default async function loader(): Promise<void> {
    await (await import('@/services/postgres')).init();

    await import('@/subscribers/mqtt-to-influx');

    await import('@/api');

    // Uncomment to use
    // await import('@/jobs/template');
}
