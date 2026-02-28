import { Button } from "@/app/components/ui/Button";

export function StickyOrderButton() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/90 backdrop-blur sm:hidden">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <a href="#order" aria-label="Jump to order form">
          <Button className="w-full">Order Now</Button>
        </a>
      </div>
    </div>
  );
}