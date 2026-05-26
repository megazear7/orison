#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
overall_status=0

compare_directories() {
	local test_dir="$1"
	local dist_dir="$test_dir/dist"
	local expected_dir="$test_dir/expected"
	local compare_status=0
	local file_list

	if [[ ! -d "$dist_dir" ]]; then
		echo "FAIL: $(basename "$test_dir") missing dist directory"
		return 1
	fi

	if [[ ! -d "$expected_dir" ]]; then
		echo "FAIL: $(basename "$test_dir") missing expected directory"
		return 1
	fi

	file_list="$({
		find "$dist_dir" -type f | sed "s#^$dist_dir/##"
		find "$expected_dir" -type f | sed "s#^$expected_dir/##"
	} | sort -u)"

	while IFS= read -r relative_path; do
		[[ -z "$relative_path" ]] && continue

		local dist_file="$dist_dir/$relative_path"
		local expected_file="$expected_dir/$relative_path"

		if [[ ! -f "$dist_file" ]]; then
			echo "FAIL: $(basename "$test_dir") $relative_path missing from dist"
			compare_status=1
			continue
		fi

		if [[ ! -f "$expected_file" ]]; then
			echo "FAIL: $(basename "$test_dir") $relative_path missing from expected"
			compare_status=1
			continue
		fi

		if diff_output="$(diff -u "$expected_file" "$dist_file")"; then
			echo "PASS: $(basename "$test_dir") $relative_path"
		else
			echo "FAIL: $(basename "$test_dir") $relative_path"
			echo "$diff_output"
			compare_status=1
		fi
	done <<< "$file_list"

	return "$compare_status"
}

for test_dir in "$SCRIPT_DIR"/*/; do
	[[ ! -d "$test_dir" ]] && continue

	test_name="$(basename "$test_dir")"
	echo "Running $test_name"

	pushd "$test_dir" >/dev/null || exit 1

	if ! npm ci; then
		echo "FAIL: $test_name npm ci"
		overall_status=1
		popd >/dev/null || exit 1
		continue
	fi

	if ! npm run build; then
		echo "FAIL: $test_name npm run build"
		overall_status=1
		popd >/dev/null || exit 1
		continue
	fi

	if ! compare_directories "$test_dir"; then
		overall_status=1
	else
		echo "PASS: $test_name"
	fi

	popd >/dev/null || exit 1
done

if [[ "$overall_status" -eq 0 ]]; then
	echo "OVERALL RESULT: PASS"
else
	echo "OVERALL RESULT: FAIL"
fi

exit "$overall_status"
