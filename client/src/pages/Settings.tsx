import { AccountSettingsCards, ChangePasswordCard, DeleteAccountCard } from "@daveyplate/better-auth-ui"
const Settings = () => {
    return (
        <div className="w-full p-4 flex justify-center items-center min-h-[90vh] flex-col gap-6 py-20 pt-24">
            <div className="fixed inset-0 dot-grid opacity-20 pointer-events-none -z-10" />
            <AccountSettingsCards
                classNames={{
                    card: {
                        base: 'max-w-xl mx-auto rounded-2xl',
                        footer: 'border-white/5'
                    }
                }} />
            <div className="w-full">
                <ChangePasswordCard classNames={{
                    base: 'max-w-xl mx-auto rounded-2xl',
                    footer: 'border-white/5'
                }} />
            </div>
            <div className="w-full">
                <DeleteAccountCard classNames={{
                    base: 'max-w-xl mx-auto rounded-2xl'
                }} />
            </div>
        </div>
    )
}

export default Settings