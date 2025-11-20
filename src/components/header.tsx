import Link from "next/link"

export const Header = ()=> {
    return <header className = "">
        <nav>
            <Link href = "/summarize">New Summary</Link>
            <Link href = "/history">History</Link>
        </nav>
    </header>
}