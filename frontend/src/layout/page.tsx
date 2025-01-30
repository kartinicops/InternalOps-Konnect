// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { Button } from "@/components/ui/button"

// export function Nav() {
//   const pathname = usePathname()

//   return (
//     <div className="flex items-center space-x-4">
//       <Button
//         variant={pathname === "/projects" ? "default" : "ghost"}
//         asChild
//       >
//         <Link href="/projects">Projects</Link>
//       </Button>
//       <Button
//         variant={pathname === "/experts" ? "default" : "ghost"}
//         asChild
//       >
//         <Link href="/experts">Experts</Link>
//       </Button>
//     </div>
//   )
// }