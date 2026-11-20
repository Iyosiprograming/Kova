import time
import threading
from typing import Any, Optional, Dict, Tuple


class TTLCache:
    """
    Lightweight, thread-safe in-memory cache with Time-To-Live (TTL) expiration.
    Used to cache Cinemeta catalogs (15m), metadata (30m), and Sports matches (60s).
    """

    def __init__(self, default_ttl: int = 300):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.Lock()
        self._default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve item by key. Returns None if key is missing or expired.
        """
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.time() > expires_at:
                del self._cache[key]
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Store value with a TTL in seconds.
        """
        ttl_seconds = ttl if ttl is not None else self._default_ttl
        expires_at = time.time() + ttl_seconds
        with self._lock:
            self._cache[key] = (value, expires_at)

    def delete(self, key: str) -> bool:
        """
        Remove key from cache.
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear(self) -> None:
        """
        Clear all entries.
        """
        with self._lock:
            self._cache.clear()

    def cleanup(self) -> int:
        """
        Prune all expired entries to prevent memory growth.
        """
        now = time.time()
        with self._lock:
            expired_keys = [k for k, (_, exp) in self._cache.items() if now > exp]
            for k in expired_keys:
                del self._cache[k]
            return len(expired_keys)


# Global singleton cache instance
memory_cache = TTLCache()

# Standard TTL constants (in seconds)
TTL_CATALOG = 15 * 60     # 15 minutes
TTL_META = 30 * 60        # 30 minutes
TTL_SPORTS = 60           # 60 seconds
