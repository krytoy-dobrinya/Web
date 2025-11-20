"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Summarize() {
    
    const [url, setUrl] = useState("")
    
    return <div><Input
    value={url}
        onChange={(ev)=>{
            setUrl(ev.target.value)
        }}
    />
    <Button>Summarize</Button>
    </div>
}