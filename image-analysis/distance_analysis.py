import cv2
import numpy as np
import os
import openpyxl

# mm/px – adjust this according to your export resolution
scale_factor = 0.352778  # based on 176.389 mm / 500 px

def analyze_image(image_path):
    """Analyzes a single image, detects colored circles, calculates distances."""
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=25,
                               param1=50, param2=30, minRadius=40, maxRadius=60)

    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        red_circle, blue_circle, green_circles = None, None, []

        for (x, y, r) in circles:
            color = image[y+15, x]
            b, g, r_ = color

            if r_ > 150 and g < 150 and b < 150:
                red_circle = (x, y)
            elif b > 150 and r_ < 150 and g < 150:
                blue_circle = (x, y)
            elif g > 150 and r_ > 100:
                green_circles.append((x, y))

        distances = {}
        if red_circle and blue_circle:
            distances["Red-Blue"] = np.linalg.norm(np.array(red_circle) - np.array(blue_circle)) * scale_factor

        for i, green in enumerate(green_circles):
            if red_circle:
                distances[f"Red-Green-{i+1}"] = np.linalg.norm(np.array(red_circle) - np.array(green)) * scale_factor
            if blue_circle:
                distances[f"Blue-Green-{i+1}"] = np.linalg.norm(np.array(blue_circle) - np.array(green)) * scale_factor

        return distances
    return None

def process_images_and_save_to_excel(folder_path, output_excel):
    """Processes all PNG images in a folder and writes distances to Excel."""
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Distances"

    headers = ["Image Name", "Red-Blue"] + [f"Red-Green-{i+1}" for i in range(10)] + [f"Blue-Green-{i+1}" for i in range(10)]
    sheet.append(headers)

    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            image_path = os.path.join(folder_path, filename)
            distances = analyze_image(image_path)

            if distances:
                row = [filename, distances.get("Red-Blue", "N/A")]
                for i in range(10):
                    row.append(distances.get(f"Red-Green-{i+1}", "N/A"))
                for i in range(10):
                    row.append(distances.get(f"Blue-Green-{i+1}", "N/A"))
                sheet.append(row)

    workbook.save(output_excel)
    print(f"Data saved to {output_excel}")
