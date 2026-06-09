This directory is used as a local Node.js runtime cache.

On launch, the dashboard first looks for a compatible system Node.js runtime
(Node 24 or newer). If none is available, it downloads the matching official
Node.js package for the current operating system and CPU architecture, verifies
the SHA256 checksum from Node's official SHASUMS256.txt file, and extracts it
under this directory.

Downloaded archives, extracted runtimes, and temporary files are intentionally
ignored by Git.
