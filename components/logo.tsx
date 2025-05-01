import Link from "next/link"
import Image from "next/image"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center">
        <Image
          src="https://iytu5oqsloncu0k0.public.blob.vercel-storage.com/uploads/autodas-logo-UrwqmxnXboQNzcoM4glah74p3w56Ta.svg"
          alt="Autodas"
          width={120}
          height={32}
          className="h-8 w-auto"
        />
      </div>
    </Link>
  )
}
