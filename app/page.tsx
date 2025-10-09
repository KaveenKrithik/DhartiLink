import { WalletProvider } from "@/contexts/wallet-context"
import MainPageContent from "@/components/main-page-content"

export default function Page() {
  return (
    <WalletProvider>
      <MainPageContent />
    </WalletProvider>
  )
}
