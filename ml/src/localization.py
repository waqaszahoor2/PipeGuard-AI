from collections.abc import Mapping


def localize_zone(
    abnormal_sensor_ids: list[str],
    zone_mapping: Mapping[str, list[str]],
) -> str | None:
    scores = {
        zone: len(set(abnormal_sensor_ids).intersection(sensors))
        for zone, sensors in zone_mapping.items()
    }
    if not scores or max(scores.values()) == 0:
        return None
    return max(scores, key=scores.get)
