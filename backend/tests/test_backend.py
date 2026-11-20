import pytest
import httpx
from backend.main import app
from backend.db import init_db, remove_from_watchlist, delete_history_item


@pytest.fixture(autouse=True)
def setup_teardown():
    init_db()
    remove_from_watchlist("tt_test_123")
    delete_history_item("tt_test_123")
    yield
    remove_from_watchlist("tt_test_123")
    delete_history_item("tt_test_123")


@pytest.mark.anyio
async def test_root_status():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        # When dist/ is built it serves index.html; otherwise JSON placeholder
        assert "Kova" in response.text or "kova" in response.text.lower()

        # Heartbeat endpoint
        hb_res = await client.post("/api/heartbeat")
        assert hb_res.status_code == 200
        assert hb_res.json().get("status") == "ok"


@pytest.mark.anyio
async def test_watchlist_crud():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Add to watchlist
        payload = {
            "imdb_id": "tt_test_123",
            "media_type": "movie",
            "title": "Unit Test Movie",
            "poster": "https://example.com/poster.jpg",
            "rating": 8.5
        }
        create_res = await client.post("/api/watchlist", json=payload)
        assert create_res.status_code == 201

        # 2. Check watchlist
        check_res = await client.get("/api/watchlist/check/tt_test_123")
        assert check_res.status_code == 200
        assert check_res.json().get("in_watchlist") is True

        # 3. List watchlist
        list_res = await client.get("/api/watchlist")
        assert list_res.status_code == 200
        items = list_res.json().get("items", [])
        assert any(item["imdb_id"] == "tt_test_123" for item in items)

        # 4. Delete from watchlist
        del_res = await client.delete("/api/watchlist/tt_test_123")
        assert del_res.status_code == 200

        # 5. Check again
        check_res2 = await client.get("/api/watchlist/check/tt_test_123")
        assert check_res2.status_code == 200
        assert check_res2.json().get("in_watchlist") is False


@pytest.mark.anyio
async def test_watch_history_crud():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Add to history
        payload = {
            "imdb_id": "tt_test_123",
            "media_type": "series",
            "title": "Unit Test Series",
            "poster": "https://example.com/series.jpg",
            "season": 2,
            "episode": 5
        }
        post_res = await client.post("/api/history", json=payload)
        assert post_res.status_code == 200

        # 2. List history
        list_res = await client.get("/api/history")
        assert list_res.status_code == 200
        items = list_res.json().get("items", [])
        found = [i for i in items if i["imdb_id"] == "tt_test_123"]
        assert len(found) == 1
        assert found[0]["season"] == 2
        assert found[0]["episode"] == 5

        # 3. Delete from history
        del_res = await client.delete("/api/history/tt_test_123")
        assert del_res.status_code == 200


@pytest.mark.anyio
async def test_search_and_catalog_endpoints():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Test catalog
        res = await client.get("/api/catalog/movie?sort=top")
        assert res.status_code == 200
        data = res.json()
        assert "metas" in data
        assert isinstance(data["metas"], list)

        # Test search
        s_res = await client.get("/api/search?q=Inception")
        assert s_res.status_code == 200
        s_data = s_res.json()
        assert "results" in s_data
        assert isinstance(s_data["results"], list)


@pytest.mark.anyio
async def test_sports_endpoints():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/sports/matches")
        assert res.status_code == 200
        data = res.json()
        assert "matches" in data
        assert isinstance(data["matches"], list)
