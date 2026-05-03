import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
    const { pathname } = useParams()

    return (
        <main className="flex flex-col justify-center items-center min-h-screen pt-16 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="fixed inset-0 dot-grid opacity-20 pointer-events-none -z-10" />
            <AuthView classNames={{ base: 'max-w-md w-full rounded-2xl' }} pathname={pathname} />
        </main>
    )
}