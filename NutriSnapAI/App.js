import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [image, setImage] = useState(null);
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [meals, setMeals] = useState([]);

  const foodDatabase = {
    chicken: { calories: 165, protein: 31 },
    egg: { calories: 155, protein: 13 },
    rice: { calories: 130, protein: 2.7 },
    milk: { calories: 61, protein: 3.2 },
    banana: { calories: 89, protein: 1.1 },
    paneer: { calories: 265, protein: 18.3 },
    dal: { calories: 116, protein: 9 }
  };

  // Select food image
  const pickImage = async () => {
    // Request permission/launch library using proper Expo API enum
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Add food to daily record
  const addFood = () => {
    const name = food.toLowerCase().trim();
    const grams = Number(quantity);

    if (!foodDatabase[name]) {
      Alert.alert(
        "Food not found",
        "Enter chicken, egg, rice, milk, banana, paneer or dal."
      );
      return;
    }

    if (!Number.isFinite(grams) || grams <= 0) {
      Alert.alert("Invalid quantity", "Enter a valid quantity in grams.");
      return;
    }

    const data = foodDatabase[name];
    const newMeal = {
      id: Date.now().toString(),
      name: food.trim(),
      quantity: grams,
      calories: (data.calories * grams) / 100,
      protein: (data.protein * grams) / 100,
      image: image
    };

    setMeals([...meals, newMeal]);
    setFood("");
    setQuantity("100");
    setImage(null);
  };

  // Calculate daily totals
  const totalCalories = meals.reduce(
    (total, item) => total + item.calories,
    0
  );

  const totalProtein = meals.reduce(
    (total, item) => total + item.protein,
    0
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>NutriSnap AI</Text>
      <Text style={styles.subtitle}>Track your food. Track your progress.</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Today's Nutrition</Text>
        <Text style={styles.number}>{totalCalories.toFixed(0)} kcal</Text>
        <Text style={styles.label}>Total Calories</Text>

        <Text style={styles.number}>{totalProtein.toFixed(1)} g</Text>
        <Text style={styles.label}>Total Protein</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Add Your Food</Text>

        <Pressable style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Food Image</Text>
        </Pressable>

        {image && <Image source={{ uri: image }} style={styles.foodImage} />}

        <TextInput
          style={styles.input}
          placeholder="Food name (example: chicken)"
          placeholderTextColor="#888"
          value={food}
          onChangeText={setFood}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantity in grams"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Pressable style={styles.button} onPress={addFood}>
          <Text style={styles.buttonText}>Add Food</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Food History</Text>

        {meals.length === 0 ? (
          <Text style={styles.emptyText}>No food added yet today.</Text>
        ) : (
          meals.map((item) => (
            <View key={item.id} style={styles.meal}>
              <Text style={styles.foodName}>
                {item.name} ({item.quantity} g)
              </Text>
              <Text style={styles.mealDetail}>
                {item.calories.toFixed(0)} kcal | {item.protein.toFixed(1)} g protein
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820"
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 45
  },
  subtitle: {
    color: "#AAAAAA",
    marginBottom: 20
  },
  card: {
    backgroundColor: "#1E2935",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15
  },
  number: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4ADE80"
  },
  label: {
    color: "#AAAAAA",
    marginBottom: 15
  },
  button: {
    backgroundColor: "#22C55E",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold"
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    color: "#000000"
  },
  foodImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10
  },
  meal: {
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingVertical: 12
  },
  foodName: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 17
  },
  mealDetail: {
    color: "#CCCCCC",
    marginTop: 4
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic"
  }
});