from __future__ import annotations

from dataclasses import dataclass
from datetime import time, datetime, timedelta


@dataclass(frozen=True)
class RangoHorario:
    inicio: time
    fin: time

    def __post_init__(self):
        if self.inicio >= self.fin:
            raise ValueError("inicio must be before fin")

    def overlaps_with(self, other: RangoHorario) -> bool:
        return self.inicio < other.fin and other.inicio < self.fin

    def contains(self, momento: time) -> bool:
        return self.inicio <= momento < self.fin

    def duration_minutes(self) -> int:
        inicio_dt = datetime.combine(datetime.min, self.inicio)
        fin_dt = datetime.combine(datetime.min, self.fin)
        return int((fin_dt - inicio_dt).total_seconds() // 60)
