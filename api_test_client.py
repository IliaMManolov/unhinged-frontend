import requests
import json
import time

BASE_URL = "http://localhost:3000/api"
POLLING_INTERVAL_MS = 5000 # Poll every 5 seconds (matching client)

def get_page_data() -> dict | None:
    """Fetches all page data."""
    try:
        response = requests.get(f"{BASE_URL}/page-data")
        response.raise_for_status()  # Raise an exception for HTTP errors
        print("GET /page-data: Success")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page data: {e}")
        print(f"Response content: {response.content.decode() if response else 'No response'}")
        return None

def update_radar_data(data: list[int]) -> None:
    """Updates the radar chart data."""
    payload = {"data": data}
    try:
        response = requests.post(f"{BASE_URL}/update-radar-data", json=payload)
        response.raise_for_status()
        print(f"POST /update-radar-data: Success - {response.json().get('message')}")
    except requests.exceptions.RequestException as e:
        print(f"Error updating radar data: {e}")
        print(f"Response content: {response.content.decode() if response else 'No response'}")

def update_graph_node(endpoint: str, image_url: str, title: str, alt_text: str | None = None) -> None:
    """Updates a graph node (top or bottom)."""
    payload: dict[str, str | None] = {"imageUrl": image_url, "title": title}
    if alt_text:
        payload["altText"] = alt_text
    try:
        response = requests.post(f"{BASE_URL}/{endpoint}", json=payload)
        response.raise_for_status()
        print(f"POST /{endpoint}: Success - {response.json().get('message')}")
    except requests.exceptions.RequestException as e:
        print(f"Error updating graph node ({endpoint}): {e}")
        print(f"Response content: {response.content.decode() if response else 'No response'}")

def add_carousel_node(node_data: dict) -> dict | None:
    """Adds a new node to the carousel."""
    try:
        response = requests.post(f"{BASE_URL}/add-carousel-node", json=node_data)
        response.raise_for_status()
        print(f"POST /add-carousel-node: Success - {response.json().get('message')}")
        return response.json().get("item")
    except requests.exceptions.RequestException as e:
        print(f"Error adding carousel node: {e}")
        print(f"Response content: {response.content.decode() if response else 'No response'}")
        return None

def update_carousel_node(node_id: str, new_props_data: dict) -> None:
    """Updates an existing carousel node's props."""
    # The API expects the full node data including id and type for an update.
    # We need to fetch the current node data, update its props, then send the whole thing.
    # This is a simplified example; a more robust client might merge intelligently.
    
    # First, get current page data to find the node
    current_data = get_page_data()
    if not current_data:
        print("Cannot update carousel node: failed to fetch current data.")
        return

    target_node = None
    for item in current_data.get("carouselItems", []):
        if item.get("id") == node_id:
            target_node = item
            break
    
    if not target_node:
        print(f"Cannot update carousel node: Node with ID {node_id} not found.")
        return

    # Construct the full payload for update, merging new_props_data into existing props
    updated_node_payload = {
        "id": target_node["id"],
        "type": target_node["type"],
        "props": {**target_node.get("props", {}), **new_props_data}
    }
    
    try:
        response = requests.post(f"{BASE_URL}/update-carousel-node", json=updated_node_payload)
        response.raise_for_status()
        print(f"POST /update-carousel-node: Success - {response.json().get('message')}")
    except requests.exceptions.RequestException as e:
        print(f"Error updating carousel node {node_id}: {e}")
        print(f"Response content: {response.content.decode() if response else 'No response'}")


def delete_carousel_node(node_id: str) -> None:
    """Deletes a node from the carousel."""
    payload = {"id": node_id}
    try:
        response = requests.post(f"{BASE_URL}/delete-carousel-node", json=payload)
        response.raise_for_status()
        print(f"POST /delete-carousel-node: Success - {response.json().get('message')}")
    except requests.exceptions.RequestException as e:
        print(f"Error deleting carousel node {node_id}: {e}")
        print(f"Response content: {response.content.decode() if response else 'No response'}")


if __name__ == "__main__":
    print("--- Testing Page Data API ---")

    # 1. Get initial page data
    print("\n--- 1. Fetching Initial Page Data ---")
    initial_data = get_page_data()
    if initial_data:
        print(json.dumps(initial_data, indent=2))
        # Keep track of carousel item IDs for later updates/deletions
        carousel_item_ids = [item['id'] for item in initial_data.get('carouselItems', [])]
    else:
        carousel_item_ids = []
        print("Could not retrieve initial data. Some tests might fail.")

    time.sleep(2)

    # 2. Update Radar Data
    print("\n--- 2. Updating Radar Data ---")
    new_radar_values = [10, 2, 8, 3, 7, 4]
    update_radar_data(new_radar_values)
    time.sleep(POLLING_INTERVAL_MS / 1000 + 1) # Wait for polling + buffer

    # 3. Update Top Graph Node
    print("\n--- 3. Updating Top Graph Node ---")
    update_graph_node("update-top-graph-node", "https://picsum.photos/id/10/96", "New Top Node from Python", "Alt for new top node")
    time.sleep(POLLING_INTERVAL_MS / 1000 + 1)

    # 4. Update Bottom Graph Node
    print("\n--- 4. Updating Bottom Graph Node ---")
    update_graph_node("update-bottom-graph-node", "https://picsum.photos/id/20/96", "New Bottom Node (Py)", "Alt for new bottom node")
    time.sleep(POLLING_INTERVAL_MS / 1000 + 1)

    # 5. Add a new TextNode
    print("\n--- 5. Adding a Text Carousel Node ---")
    text_node_payload = {
        "type": "textNode", # API requires 'textNode' or 'imageTextNode'
        "props": {
            "inputText": "Python Script Query:",
            "responseText": "This node was added by a Python script!",
            "confidenceScore": 0.95,
            "isLoadingResponse": False,
            "isCalculatingConfidence": False
        }
    }
    added_text_node = add_carousel_node(text_node_payload)
    if added_text_node and 'id' in added_text_node:
        carousel_item_ids.append(added_text_node['id'])
    time.sleep(POLLING_INTERVAL_MS / 1000 + 1)

    # 6. Add a new ImageTextNode
    print("\n--- 6. Adding an ImageText Carousel Node ---")
    image_text_node_payload = {
        "type": "imageTextNode",
        "props": {
            "promptText": "Python Image Request",
            "imageUrl": "https://picsum.photos/seed/pythonscript/200/300",
            "imageAlt": "Image from Python",
            "responseText": "This image node was also added by Python.",
            "isLoadingResponse": False
        }
    }
    added_image_node = add_carousel_node(image_text_node_payload)
    if added_image_node and 'id' in added_image_node:
        carousel_item_ids.append(added_image_node['id'])
    time.sleep(POLLING_INTERVAL_MS / 1000 + 1)
    
    # 7. Update a Carousel Node (e.g., the first one added by this script, if it exists)
    print("\n--- 7. Updating a Carousel Node ---")
    if added_text_node and 'id' in added_text_node:
        node_to_update_id = added_text_node['id']
        update_props = {
            "responseText": "This text node has been UPDATED by Python!",
            "confidenceScore": 0.99
        }
        update_carousel_node(node_to_update_id, update_props)
        time.sleep(POLLING_INTERVAL_MS / 1000 + 1)
    else:
        print("Skipping update test: No text node was successfully added by this script run.")

    # 8. Delete a Carousel Node (e.g., the last one added by this script, if it exists)
    print("\n--- 8. Deleting a Carousel Node ---")
    if added_image_node and 'id' in added_image_node:
        node_to_delete_id = added_image_node['id']
        delete_carousel_node(node_to_delete_id)
        if node_to_delete_id in carousel_item_ids: # Keep local list consistent
            carousel_item_ids.remove(node_to_delete_id)
        time.sleep(POLLING_INTERVAL_MS / 1000 + 1)
    elif carousel_item_ids: # Fallback: delete the last known node if any
        node_to_delete_id = carousel_item_ids[-1]
        print(f"Fallback: Attempting to delete last known node ID: {node_to_delete_id}")
        delete_carousel_node(node_to_delete_id)
        carousel_item_ids.pop()
        time.sleep(POLLING_INTERVAL_MS / 1000 + 1)
    else:
        print("Skipping delete test: No carousel node ID available for deletion.")

    print("\n--- Fetching Final Page Data ---")
    final_data = get_page_data()
    if final_data:
        print(json.dumps(final_data, indent=2))

    print("\n--- API Test Script Finished ---")

# Note: The POLLING_INTERVAL_MS variable is now defined globally.
# Using sleep (polling interval in seconds + 1s buffer) for demo.
# A more robust script might fetch data after each POST to confirm changes immediately 
# rather than relying on polling delay.
# POLLING_INTERVAL_MS = 5000 # This line is now removed from here

# Note: The POLLING_INTERVAL_MS variable is not defined here, 
# but in app/page.tsx it's 5000ms.
# Using 6 seconds sleep (5s + 1s buffer) for demo.
# A more robust script might fetch data after each POST to confirm changes immediately 
# rather than relying on polling delay.
# POLLING_INTERVAL_MS = 5000 # Define for clarity in sleeps 