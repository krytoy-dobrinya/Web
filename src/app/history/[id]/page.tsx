export default async function HistoryItem({params}: {
    params: Promise<{id: string}>
}) {
    const { id } = await params
    return <div>HistoryItem {id}</div>
}