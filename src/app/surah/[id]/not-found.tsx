import Link from "next/link";

// This route-specific not-found UI handles invalid or unknown Surah IDs.
export default function SurahNotFound() {
  return (
    <main className="surah-not-found-page">
      {/* This heading gives clear feedback about why the requested route failed. */}
      <h1 className="surah-not-found-title">Surah Not Found</h1>

      {/* This text explains the expected reason in simple language. */}
      <p className="surah-not-found-text">
        The requested Surah does not exist in the current dataset or the ID is invalid.
      </p>

      {/* This link returns users to the index page to continue browsing. */}
      <Link href="/" className="back-link">
        Back To Surah List
      </Link>
    </main>
  );
}
