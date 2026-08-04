from pathlib import Path
import argparse
import zipfile


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--zip",
        default="data/raw/PipeGuard_AI_Research_Dataset_Pack.zip",
        help="Path to the original dataset ZIP",
    )
    parser.add_argument(
        "--output",
        default="data/interim",
        help="Extraction directory",
    )
    args = parser.parse_args()
    zip_path = Path(args.zip)
    output = Path(args.output)
    if not zip_path.exists():
        raise SystemExit(f"Dataset ZIP not found: {zip_path}")
    output.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            destination = (output / member.filename).resolve()
            if output.resolve() not in destination.parents and destination != output.resolve():
                raise SystemExit("Unsafe path found inside ZIP")
        archive.extractall(output)
    print(f"Extracted dataset to {output.resolve()}")


if __name__ == "__main__":
    main()
