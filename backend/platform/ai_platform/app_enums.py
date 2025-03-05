from enum import Enum


class AssignmentType(str, Enum):
    GRADED = "graded"
    PRACTICE = "practice"
    CODING = "coding"
