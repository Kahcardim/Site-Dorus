import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("rating_sync", Path(__file__).resolve().parents[2] / "scripts/sync_google_rating.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class GoogleRatingTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.output = Path(self.directory.name) / "google-rating.json"
        self.original = {"rating": 4.9, "reviews": 48, "source": "Google", "updatedAt": "2026-09-01T00:00:00Z"}
        self.output.write_text(json.dumps(self.original), encoding="utf-8")

    def test_unchanged_values_preserve_bytes_and_timestamp(self):
        before = self.output.read_bytes()
        self.assertFalse(module.save_rating(4.9, 48, self.output))
        self.assertEqual(before, self.output.read_bytes())

    def test_display_rounding_does_not_create_a_change(self):
        before = self.output.read_bytes()
        self.assertFalse(module.save_rating(4.94, 48, self.output))
        self.assertEqual(before, self.output.read_bytes())

    def test_changed_count_updates_the_snapshot(self):
        self.assertTrue(module.save_rating(4.9, 49, self.output))
        self.assertEqual(json.loads(self.output.read_text())["reviews"], 49)

    def test_changed_rating_updates_the_snapshot(self):
        self.assertTrue(module.save_rating(4.8, 48, self.output))
        self.assertEqual(json.loads(self.output.read_text())["rating"], 4.8)

    def test_missing_snapshot_is_created(self):
        target = Path(self.directory.name) / "new.json"
        self.assertTrue(module.save_rating(4.9, 48, target))

    def test_invalid_snapshot_is_replaced_with_valid_data(self):
        self.output.write_text("invalid")
        self.assertTrue(module.save_rating(4.9, 48, self.output))
        self.assertEqual(json.loads(self.output.read_text())["source"], "Google")

    def test_network_failure_does_not_overwrite_snapshot(self):
        before = self.output.read_bytes()
        with patch.dict(module.os.environ, {"GOOGLE_PLACES_API_KEY": "test-only", "GOOGLE_PLACE_ID": module.EXPECTED_PLACE_ID}), patch.object(module.urllib.request, "urlopen", side_effect=OSError("offline")):
            with self.assertRaises(SystemExit):
                module.main()
        self.assertEqual(before, self.output.read_bytes())
