import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import MobileBottomNav from "./MobileBottomNav"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import GufoAiWidget from "./GufoAiWidget"

export default function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname === "/dashboard"

  useEffect(() => {
    const overlaySelector = ".erp-workspace main .fixed.inset-0, .erp-workspace main [style*='position: fixed']"
    let frame = 0

    const fitOpenDialogs = () => {
      document.querySelectorAll<HTMLElement>(overlaySelector).forEach((overlay) => {
        const dialog = overlay.firstElementChild as HTMLElement | null
        if (!dialog) return

        // Measure the original content, then reduce only dialogs that cannot fit vertically.
        dialog.style.removeProperty("--erp-dialog-scale")
        dialog.classList.remove("erp-modal-fitted")
        const availableHeight = Math.max(320, window.innerHeight - 32)
        const naturalHeight = Math.max(dialog.scrollHeight, Math.ceil(dialog.getBoundingClientRect().height))

        if (naturalHeight > availableHeight) {
          dialog.style.setProperty("--erp-dialog-scale", String(availableHeight / naturalHeight))
          dialog.classList.add("erp-modal-fitted")
        }
      })
    }

    const scheduleFit = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(fitOpenDialogs)
    }

    const observer = new MutationObserver(scheduleFit)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("resize", scheduleFit)
    scheduleFit()

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", scheduleFit)
    }
  }, [])

  return (
    <div className={`erp-workspace min-h-screen overflow-x-hidden bg-[#f1f2f5] text-slate-900${isDashboard ? " xl:h-screen xl:overflow-hidden" : ""}`}>
      <div className={`flex min-h-screen overflow-x-hidden${isDashboard ? " xl:h-screen" : ""}`}>
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileSidebarOpen(true)} />

          <main className={isDashboard
            ? "erp-dashboard-shell flex-1 overflow-x-hidden px-3 pb-24 pt-3 md:px-5 md:pb-5 md:pt-4 xl:overflow-hidden xl:p-3"
            : "erp-desktop-dense flex-1 overflow-x-hidden px-3 pb-24 pt-3 md:px-5 md:pb-5 md:pt-4 xl:px-6 xl:pb-6 xl:pt-5"}
          >
            <div className={`mx-auto w-full min-w-0${isDashboard ? " h-full max-w-none" : " max-w-[1800px]"}`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav onOpenMenu={() => setMobileSidebarOpen(true)} />
      {!isDashboard ? <GufoAiWidget /> : null}
    </div>
  )
}
