import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-background">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gradient-gold mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3 text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          The page you're looking for may have been moved or doesn't exist.
          Please check the URL is correct.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-gold text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
      <p className="absolute bottom-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} MOSI-OA – TUNYA SOUTHERN AWARDS
      </p>
    </div>
  );
}
