import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDB } from "../../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import HomeHeader from "../Components/HomeHeader";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import "react-native-gesture-handler";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import subjects from "../Components/SubjectsList";

//default img if no img posted with listing
import defaultImg from "../../assets/defaultImg.png";
import { ScrollView } from "react-native-gesture-handler";


const Home = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // search bar
  const [searchQuery, setSearchQuery] = useState("");

  // getting & setting listings from firestore
  const [listings, setListings] = useState([]);
  const [originalListings, setOriginalListings] = useState([]);
  const [listingTitles, setListingTitles] = useState([]);

  // filter bottom sheet
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["65", "90%"], []);


  //
  //
  // Filter Logic
  //
  //


  const [filtersHistory, setFiltersHistory] = useState([]);
  //const [priceRange, setPriceRange] = useState([0, 100]);
  const [sliderValues, setSliderValues] = useState([0, 250]);

  const [filters, setFilters] = useState({
    category: [],
    condition: [],
    subject: [],
    course: "",
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);

  function filterByPrice(listings, minPrice, maxPrice) {
    return listings.filter((listing) => {
      const listingPrice = Number(listing.price);
      return listingPrice >= minPrice && listingPrice <= maxPrice;
    });
  }

  function filterListings(listings, filters) {
    return listings.filter((listing) => {
      // Check for each category in filters
      return Object.keys(filters).every((category) => {
        // If no filter is selected in the category, do not filter out the item
        if (filters[category].length === 0) return true;

        // Otherwise, check if the listing's category matches any of the selected filters
        // Adjust this logic based on your data structure, especially if a listing can have multiple values for a filter category
        return filters[category].includes(listing[category]);
      });
    });
  };

  const addSubject = (subject) => {
    if (filters.subject.length < 3 && !filters.subject.includes(subject)) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        subject: [...prevFilters.subject, subject]
      }));
    } else {
    // Remove the subject from the selected subjects if already selected
      setFilters((prevFilters) => ({
        ...prevFilters,
        subject: prevFilters.subject.filter((s) => s !== subject)
      }));
    }
    setFiltersHistory((prevHistory) => [...prevHistory, filters]);
  };

  const addCategory = (category) => {
    if (filters.category.length < 3 && !filters.category.includes(category)) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        category: [...prevFilters.category, category]
      }));
    } else {
      // Remove the category if already selected
      setFilters((prevFilters) => ({
        ...prevFilters,
        category: prevFilters.category.filter((c) => c !== category)
      }));
    }
    setFiltersHistory((prevHistory) => [...prevHistory, filters]);
  };

  const addCondition = (condition) => {
    if (filters.condition.length < 3 && !filters.condition.includes(condition)) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        condition: [...prevFilters.condition, condition]
      }));
    } else {
      // Remove the condition if already selected
      setFilters((prevFilters) => ({
        ...prevFilters,
        condition: prevFilters.condition.filter((c) => c !== condition)
      }));
    }
    setFiltersHistory((prevHistory) => [...prevHistory, filters]);
  };

  const addCourseNum = (courseNumber) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      course: courseNumber.toString() // Directly setting the course number
    }));

    setFiltersHistory((prevHistory) => [...prevHistory, {
      ...filters,
      course: courseNumber
    }]);
  };

  const addPrice = (minPrice, maxPrice) => {
    setMinPrice(minPrice);
    if (maxPrice === 250) {
      setMaxPrice(50000);
      applyFilters(filterByPrice(originalListings, minPrice, 50000)); // Apply additional filters and search query
    } else {
      setMaxPrice(maxPrice);
      applyFilters(filterByPrice(originalListings, minPrice, maxPrice)); // Apply additional filters and search query
    }
  };
    
  function applyFilters(filteredListings) {
    let filteredListingsAfterFilters = filteredListings;
  
    // Apply other filters if any
    Object.keys(filters).forEach((category) => {
      if (category !== "price" && filters[category].length > 0) {
        filteredListingsAfterFilters = filteredListingsAfterFilters.filter((listing) =>
          filters[category].includes(listing[category])
        );
      }
    });

    // Apply search query if present
    if (searchQuery.trim() !== "" ) {
      const userInput = searchQuery;
      const transformedTitlesPrices = transformListingTitles(filteredListingsAfterFilters);
      
      const searchResults = searchListings(userInput, transformedTitlesPrices, filteredListingsAfterFilters);
      const sortedResults = sortSearchResults(searchResults, userInput);

      setListings(sortedResults);
    } else {
      setListings(filteredListingsAfterFilters);
    }
  };

  const onFilterPress = (categoryName) => {
    // Logic to open the bottom sheet corresponding to the category
    console.log(`Opening bottom sheet for category: ${categoryName}`);
    // You can implement logic here to determine which bottom sheet to open
    bottomSheetModalRef.current?.present();

    switch (categoryName) {
      case "Category":
        setFilterStack([...filterStack, "Category"]);
        renderBottomSheetContent();
        break;
      case "Subject":
        setFilterStack([...filterStack, "Subject"]);
        renderBottomSheetContent();
        break;
      case "Condition":
        setFilterStack([...filterStack, "Condition"]);
        renderBottomSheetContent();
        break;
      case "Course":
        setFilterStack([...filterStack, "Course"]);
        renderBottomSheetContent();
        break;
      case "Price":
        setFilterStack([...filterStack, "Price"]);
        renderBottomSheetContent();
        break;
      default:
        console.log("Invalid category");
        break;
    }
  };

  const onFilterClearPress = (categoryName) => {
    // Logic to open the bottom sheet corresponding to the category
    console.log(`Clearing category: ${categoryName}`);

    const updatedFilters = { ...filters };
    
    switch (categoryName) {
      case "Category":
        // Clear category filters
        updatedFilters.category = [];
        break;
      case "Subject":
        // Clear subject filters
        updatedFilters.subject = [];
        break;
      case "Condition":
        // Clear condition filters
        updatedFilters.condition = [];
        break;
      case "Course":
        updatedFilters.course = "";
        break;
      case "Price":
        setMinPrice(0);
        setMaxPrice(50000);
        setSliderValues([0, 50000]);
        addPrice(0, 50000);
        break;
    }
    setFilters(updatedFilters);

  };

  //
  //
  // Search logic.
  //
  //

  function transformTitle(input) {
    let transformedTitle = input.toUpperCase();
    //let transformedTitle = ' ' + input.toUpperCase() + ' ';

    transformedTitle = transformedTitle.replace(/[^\x00-\x7F]/g, function (char) {
        switch (char) {
            case 'Ö':
                return 'O';
            case 'Ü':
                return 'U';
            case 'Ä':
                return 'A';
            case 'É':
                return 'E';
            case 'Ñ':
                return 'N';
            case 'Ç':
                return 'C';
            case 'ß':
                return 'SS';
            case 'À':
                return 'A';
            case 'Ô':
                return 'O';
            default:
                return '';
        }
    });

    // Delete common characters
    const commonChar = [',', '.', '@', '%', '!', '?', '&', '(', ')', ':'];
    for (let i = 0; i < commonChar.length; i++) {
      const word = commonChar[i];
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
      const regex = new RegExp(escapedWord, 'g');
      transformedTitle = transformedTitle.replace(regex, "");
    }

    // Split the transformedTitle into an array of words
    const wordsArray = transformedTitle.split(/\s+/);

    // Remove common words
    const commonWords = ['THE', 'OF', 'AND', 'A', 'TO', 'IN', 'ON', 'FOR', 'WITH'];
    const filteredWordsArray = wordsArray.filter(word => !commonWords.includes(word));

    // Change Roman numerals
    const romanNumerals = {
        'I': 1,
        'II': 2,
        'III': 3,
        'IV': 4,
        'V': 5,
        'VI': 6,
        'VII': 7,
        'VIII': 8,
        'IX': 9,
        'X': 10
    };
    const transformedArray = filteredWordsArray.map(word => {
        return romanNumerals[word] ? romanNumerals[word] : word;
    });

    return transformedArray;
  }

  function transformListingTitles(originalListings) {
    const listingTitles = originalListings.map((originalListings) => {
      return transformTitle(originalListings.title);
    });
    return listingTitles;
  }


  // Example usage
  // function testTransformationAlgorithm() {
  //   originalListings.forEach(item => {
  //       const transformedTitle = transformTitle(item.title);
  //       console.log(`Original title: ${item.title}, Transformed title: ${transformedTitle}`);
  //   });
  // }

  // Call the test function
  //testTransformationAlgorithm();
  
  function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];
  
    // Initialize matrix with 0s
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i] ??= [];
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deletion
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }
  
    // Return the bottom-right cell of the matrix
    return matrix[len1][len2];
  }

  function searchListings(userInput, listingTitles, listings) {
    const transformedInput = transformTitle(userInput); // Transform user input

    const searchResults = [];

    // Iterate over each transformed title in listingTitles
    listingTitles.forEach((transformedTitle, index) => {
        let totalDistance = 0;
        let matchCount = 0;

        // Iterate over each word in transformedInput
        transformedInput.forEach(inputWord => {
            let minDistance = Infinity; // Initialize minDistance for each input word
            // Find the closest matching word in transformedTitle
            transformedTitle.forEach(titleWord => {
                const distance = levenshteinDistance(inputWord, titleWord);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            });

            // Add the closest matching word distance to totalDistance
            totalDistance += minDistance;
            matchCount++;
        });

        // Calculate average distance for the title based on matching words only
        const averageDistance = matchCount === 0 ? Infinity : totalDistance / matchCount;

        // Define a threshold value for average distance
        const averageDistanceThreshold = 3.5; // Example threshold value, adjust as needed

        // If average distance is below the threshold, consider it a relevant result
        if (averageDistance <= averageDistanceThreshold) {
            // Add the corresponding listing to the searchResults
            searchResults.push(listings[index]);
        }
    });

    return searchResults;
  } 

  function sortSearchResults(searchResults, userInput) {
    // Transform user input
    const transformedInput = transformTitle(userInput);

    // Calculate average distance for each item based on matching words
    const resultsWithAvgDistance = searchResults.map(item => {
        const titleWords = transformTitle(item.title);
        let totalDistance = 0;
        let matchingWordsCount = 0;

        // Calculate total distance and count of matching words
        titleWords.forEach(titleWord => {
            let minDistance = Infinity;
            transformedInput.forEach(inputWord => { // Iterate over transformed input
                const distance = levenshteinDistance(inputWord, titleWord);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            });
            if (minDistance <= 2) { // Threshold for considering a match
                totalDistance += minDistance;
                matchingWordsCount++;
            }
        });

        // Calculate average distance
        const averageDistance = matchingWordsCount === 0 ? Infinity : totalDistance / matchingWordsCount;

        return { item, averageDistance, matchingWordsCount }; // Also store matchingWordsCount
    });

    // Sort search results by average distance from lowest to highest
    resultsWithAvgDistance.sort((a, b) => {
        if (a.averageDistance !== b.averageDistance) {
            return a.averageDistance - b.averageDistance;
        } else {
            // If average distances are equal, sort by number of matching words
            return b.matchingWordsCount - a.matchingWordsCount; // Sort by descending matching words count
        }
    });

    // Return sorted search results
    return resultsWithAvgDistance.map(result => result.item);
  }
  
   //Example usage
  //  const userInput = "chemistry book"; // Example user input
  //  const searchResults = searchListings(userInput, listingTitles, listings);
  //  const sortedResults = sortSearchResults(searchResults, userInput); // Pass userInput here
  //  console.log(sortedResults.map(item => item.title));



  //
  //
  // UI Components
  //
  //

  const [filterStack, setFilterStack] = useState(["main"]);
  const [currentFilter, setCurrentFilter] = useState("main");
  const onSelectFilter = (filterName) => {
    //setCurrentFilter(filterName);
    setFilterStack([...filterStack, filterName]);
  };
  const onBack = () => {
    setFilterStack([...filterStack, "main"]);
    const newStack = [...filterStack];
    newStack.pop();
    //setFilterStack(newStack);
  }

  const renderBottomSheetContent = () => {
    const currentFilter = filterStack[filterStack.length - 1];

    switch (currentFilter) {
      case "main":
        return (
        <FilterContent 
          onSelectFilter={onSelectFilter} 
          handleClearFilters={handleClearFilters}
          selectedCategories={filters.category}
          selectedSubjects={filters.subject}
          selectedConditions={filters.condition}
          selectedCourse={filters.course}
        />
        );
      case "Category":
        return (
          <CategoryContent
            onBack={onBack}
            selectedCategories={filters.category}
            addCategory={addCategory}
          />
        );
        break; 
      case "Subject":
        return (
          <SubjectContent
            onBack={onBack}
            selectedSubjects={filters.subject}
            addSubject={addSubject}
          />
        );
        break;
      case "Condition":
        return (
          <ConditionContent
            onBack={onBack}
            selectedConditions={filters.condition}
            addCondition={addCondition}
          />
        );
        break;    
      case "Course":
        return (
          <CourseNumContent 
            onBack={onBack}
            addCourseNum={addCourseNum}
          />
        );
        break;
      case "Price":
        return (
          <PriceContent 
            onBack={onBack}
            addPrice={addPrice}
            sliderValues={sliderValues}
            setSliderValues={setSliderValues}
            handleClearFilters={handleClearFilters}
          />
        )     
      default:
        return <FilterContent onSelectFilter={onSelectFilter} handleClearFilters={handleClearFilters}/>;  
    }
  }

  function handlePresentModal() {
    setFilterStack([...filterStack, "main"]);
    bottomSheetModalRef.current?.present();
  }

  function handleSearch() {
    if(searchQuery.trim() !== "") {
      const userInput = searchQuery;
      const transformedTitles = transformListingTitles(listings);
      const searchResults = searchListings(userInput, transformedTitles, listings);
      const sortedResults = sortSearchResults(searchResults, userInput);

      // Update the listings state with the search results
      setListings(sortedResults);
      Keyboard.dismiss();
    }
  }
  // function filterByPrice(listings, minPrice, maxPrice) {
  //   return listings.filter((listing) => {
  //     const listingPrice = Number(listing.price);
  //     return listingPrice >= minPrice && listingPrice <= maxPrice;
  //   });
  // }
  

  function handleClear() {
    setSearchQuery("");

    const filteredListings = filterListings(filterByPrice(originalListings, sliderValues[0], sliderValues[1]), filters);
    setListings(filteredListings);

    Keyboard.dismiss();
  }

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestoreDB, "listing"));
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
       }));

      await setOriginalListings(documents);
      // console.log(originalListings);
      // console.log("---------------------");
          
      const filteredListings = await filterListings(documents, filters); // Apply filtering
      await setListings(filteredListings);

      handleSearch();
      // console.log(listings);
      // console.log("---------------------");

      // const transformedTitles = transformListingTitles(filteredListings);
      // await setListingTitles(transformedTitles);
      // console.log(listingTitles);
      // console.log("---------------------");

      //setSearchQuery("");
    

    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  //Fetch data everytime you come back to the screen
  useEffect(() => {
    if (isFocused) {
      fetchData();
    } 
  }, [isFocused]);

  // Function to handle filtering when filters change
  useEffect(() => {
    console.log("REFETCHING FILTERS")
    console.log("Filters:", filters);

    // if (filtersHistory.length > 0) {
    //   const anyFilterRemoved = Object.keys(filters).some((category) => {

    //     const currentFilterLength = filters[category].length;
        
    //     const previousFilterLength = filtersHistory[filtersHistory.length - 1][category].length;
      
    //     return currentFilterLength < previousFilterLength;
    //   });

    //   if (anyFilterRemoved) {
    //     if (searchQuery.trim() !== "") {
    //       setListings(searchListings(searchQuery, listingTitles, originalListings));
    //     } else {
    //       const filteredListings = filterListings(originalListings, filters);
    //       setListings(filteredListings);
    //     }
    //   } else {
    //     const filteredListings = filterListings(listings, filters);
    //     setListings(filteredListings);
    //   }
    // } else {
    //   // If filtersHistory is empty, set the listings to the original listings
    //   const filteredListings = filterListings(originalListings, filters);
    //   setListings(filteredListings);
    // }

    

    if (searchQuery.trim() !== "") {
      const filteredListings = filterListings(originalListings, filters);

      const userInput = searchQuery;
      const transformedTitles = transformListingTitles(filteredListings);
      const searchResults = searchListings(userInput, transformedTitles, filteredListings);
      const sortedResults = sortSearchResults(searchResults, userInput);

      // Update the listings state with the search results
      setListings(filterByPrice(sortedResults, minPrice, maxPrice));
      
    }
    else{
      const filteredListings = filterListings(originalListings, filters);
      setListings(filterByPrice(filteredListings, minPrice, maxPrice));
      
    }
    

  }, [filters]);

  const handleListing = (listing) => {
    navigation.navigate("Listing", { listing: listing });
  };

  const handleClearFilters = () => {
    console.log("clearing filters");
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      for (const key in updatedFilters) {
        if (Array.isArray(updatedFilters[key])) {
          updatedFilters[key] = [];
        } else {
          updatedFilters[key] = "";
        }
      }
      return updatedFilters;
    });

    setFiltersHistory(prevHistory => [...prevHistory, filters]);
    setMinPrice(0);
    setMaxPrice(50000);
    setSliderValues([0, 50000]);
    addPrice(0, 50000);
  };

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

  return (

    <View style={styles.container}>
      <HomeHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        //onFilterPress={() => setBottomSheetPosition(0)}
        handlePresentModal={handlePresentModal}
        handleSearch={handleSearch}
        handleClear={handleClear}
        onFilterPress={onFilterPress}
        onFilterClearPress={onFilterClearPress}
        filters={filters}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />

      {/* // display  of listings */}
      {listings.length > 0 ? (
        <FlatList
        style={styles.listings}
        data={listings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listingItem}>
            <TouchableOpacity onPress={() => handleListing(item)}>
              <Image
                source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
                style={styles.listingImage}
              />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.listingTitle}>{item.title}</Text>
              <Text style={styles.listingPrice}>${item.price}</Text>
            </View>
            
          </View>
        )}
        contentContainerStyle={styles.listingsContainer}
      />
      ) : (
        <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
          <Text style={styles.noResultsFound}>No results found :(</Text>
        </View>
      )}
      

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ borderRadius:50 }}
        enablePanDownToClose={true}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.bottomSheetModal}>
          {renderBottomSheetContent()}
        </View>
      </BottomSheetModal>
    </View>
  );
};

// first thing you see when you click filter button (category, subject, condition)
const FilterOption = ({ title, onPress, selectedOptions}) => {
  // console.log("SELECTED OPTIONS TEST: ")
  // console.log(`FilterOption ${title}`, selectedOptions);
  console.log("SELECTED OPTIONS: ", selectedOptions);

  let selectedOptionText = "";

  if (selectedOptions && selectedOptions.length === 1) {
    selectedOptionText = selectedOptions[0];
  } else if (selectedOptions && selectedOptions.length > 1) {
    selectedOptionText = `${selectedOptions.length} selected`;
  }

  if (title === "Course" && selectedOptions) {
    selectedOptionText = `${selectedOptions}`;
  }

  return (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.indFilterTab} >
        <Text style={styles.filterOption}>{title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center"}}>
          {selectedOptionText ? (
          <Text style={styles.selectedOptionText}>{selectedOptionText}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={20} color="#3f9eeb" style={{padding:10}}/>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const FilterContent = ({ 
  onSelectFilter, 
  handleClearFilters, 
  selectedCategories, 
  selectedSubjects,
  selectedConditions,
  selectedCourse,
  }) => (
  <View style={styles.filterContent}>

      <FilterOption 
        title="Category" 
        onPress={() => onSelectFilter("Category")} 
        selectedOptions={selectedCategories}
      />
      <FilterOption 
        title="Subject" 
        onPress={() => onSelectFilter("Subject")}
        selectedOptions={selectedSubjects}
      />
      <FilterOption 
        title="Condition" 
        onPress={() => onSelectFilter("Condition")}
        selectedOptions={selectedConditions}
        />
      <FilterOption title="Course" onPress={() => onSelectFilter("Course")} selectedOptions={selectedCourse}/>
      <FilterOption title="Price" onPress={() => onSelectFilter("Price")} selectedOptions={null}/>

    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={handleClearFilters} style={[styles.clearButton, styles.buttonOutline]}>
        <Text style={styles.buttonOutlineText}>Clear Filters</Text>
      </TouchableOpacity>
      
    </View>
  </View>
)

const CategoryContent = ({ onBack, selectedCategories, addCategory }) => (
  <View>
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Category</Text>
    </View>

    <ScrollView>
      {/* ADD ADDITIONAL CATEGORIES TO THIS ARRAY AS YOU SEE FIT */}
      {["Books", "Clothes"].map((category) => (
        <TouchableOpacity key={category} style={styles.subjectBox} onPress={() => addCategory(category)}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {selectedCategories.includes(category) && (
              <Ionicons name="checkmark-outline" size={20}/>
            )}
            <Text style={styles.filterSubjectOptions}>{category}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>  
)


//
//
//
//
//
//
//
//
//
//
//
//
const SubjectContent = ({ onBack, selectedSubjects, addSubject }) => (
  <View>
    <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subjects</Text>
      </View>

    <ScrollView>
      {/* SUBJECTS IS NOW ITS OWN COMPONENT app>screens>components>"SubjectsList.js" */}
      {subjects.map((subject) =>
        <TouchableOpacity key={subject} onPress={() => addSubject(subject)} style={styles.subjectBox}>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            {selectedSubjects.includes(subject) && (
              <Ionicons name="checkmark-outline" size={20}/>
            )}
            <Text style={styles.filterSubjectOptions}>{subject}</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>

  </View>
)

const ConditionContent = ({ onBack, selectedConditions, addCondition }) => (
  <View>
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Condition</Text>
    </View>

      <ScrollView>
        {/* ADD ADDITIONAL CONDITIONS TO THIS ARRAY AS YOU SEE FIT */}
        {["Brand New", "Like New", "Used - Excellent", "Used - Good", "Used - Fair"].map((condition) => (
          <TouchableOpacity key={condition} style={styles.subjectBox} onPress={() => addCondition(condition)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {selectedConditions.includes(condition) && (
                <Ionicons name="checkmark-outline" size={20}/>
              )}
                <Text style={styles.filterSubjectOptions}>{condition}</Text>
            </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
)

const CourseNumContent = ({ onBack, selectedConditions, addCourseNum }) => {
  const [courseNumber, setCourseNumber] = useState('');

  const handleCourseNumberChange = (number) => {
    setCourseNumber(number);
  };

  const applyCourseFilter = () => {
    // Convert courseNumber to a number if needed or keep as string based on your data
    addCourseNum(courseNumber);
  };

  return (
    <View style={styles.courseOuterContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
      </TouchableOpacity>
      <View style={styles.courseNumberContainer}>
        <Text style={styles.courseNumberText}>Course Number:</Text>
        <TextInput 
          value={courseNumber}
          onChangeText={handleCourseNumberChange}
          keyboardType="numeric"
          maxLength={4}
          placeholder="#..."
          style={styles.courseNumberInput}
        />
      </View>

      <View style={styles.applyBtnContainer}>
        <TouchableOpacity>
          <Text onPress={applyCourseFilter} style={styles.courseNumApplyBtn}>Apply</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const PriceContent = ({ onBack, addPrice, sliderValues, setSliderValues }) => {

  const sliderOneValuesChange = (values) => {
    setSliderValues(values);
  };

  const applyPriceFilter = () => {
    addPrice(sliderValues[0], sliderValues[1]);
  }

  const maxPriceText = sliderValues[1] >= 250 ? "Any" : `$${sliderValues[1]}`

  return (
    <View>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price</Text>
      </View>
      <View style={styles.valueLabels}>
        <Text>{`$${sliderValues[0]} up to ${maxPriceText}`}</Text>
      </View>
      <View style={styles.slider}>
        <MultiSlider 
          values={sliderValues}
          sliderLength={325} 
          onValuesChange={sliderOneValuesChange}
          min={0}
          max={250}
          step={5}
        />
      </View>
      <View>
        <TouchableOpacity onPress={applyPriceFilter} style={styles.applyBtnContainer}>
          <Text style={styles.courseNumApplyBtn}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f2ff",
  },
  listingsContainer: {
    backgroundColor: "white",
  },
  listingItem: {
    flex: 1,
    flexDirection: "column",
    padding: 15,
    alignItems: 'center',   
  },
  textContainer: {
    flex: 1,
    width: '100%',
    
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 5,
  },
  listingPrice: {
    fontSize: 16,
    color: "green",
    paddingLeft: 5,
  },
  listingImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    margin: 15,
    borderRadius: 15,
  },
  bottomSheetModal: {
    flex: 1,
    alignItems: "left",
    padding: 10,
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    //backgroundColor: "yellow",
    width: "100%",
    // borderBottomWidth: 1,
    // borderBottomColor: "black",
  },
  headerTitle: {
    flex: 1,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
    marginTop: -20,
  },
  filterContent: {
    width: '100%',
    //flexDirection: "row",
    //margin: 2,
  },
  filterOption: {
    //flexDirection: "row",
    padding: 10,
    //width: "100%",
    fontSize: 20,
    fontWeight: "bold",
    color: "#3f9eeb",
    //backgroundColor: "red",
    //justifyContent: "space-between",
  },
  indFilterTab: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 5,
    //backgroundColor: "pink"
  },
  backButton: {
    //padding: 10,
    //backgroundColor: "red",
    //flexDirection: "row",
    alignSelf: "flex-start",
  },
  scrollViewContainer: {
    alignSelf: "stretch",
    //flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Adjust padding as needed
    paddingBottom: 35, // Adjust padding as needed
  },
  subjectBox: {
    //flex: 1,
    //borderTopWidth: 1,
    //borderColor: "#3f9eeb",
    padding: 3,
    margin: 5,
    //backgroundColor: "#e6f2ff",
    //borderRadius: 15,
  },
  filterSubjectOptions: { //individual subjects in the subject option (Accounting, Bio, etc.)
    fontSize: 20,
    padding: 5,
    color: "#3f9eeb",
    //backgroundColor: "#e6f2ff",
  },
  valueLabels: {
    marginTop: 15,
    //backgroundColor: "yellow",
  },
  slider: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  courseOuterContainer: {
    width: "100%",
  },
  courseNumberContainer: {
    flexDirection: 'row',
    //justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 15,
    alignItems: 'center',
    //backgroundColor: "red",
    width: "100%",
  },
  courseNumberText: {
    color: "#3f9eeb",
    fontSize: 20,
    fontWeight: "700",
    //paddingHorizontal: 10,
   //width: "100%",
  },
  courseNumberInput: {
    //flex: 1,
    fontSize: 20,
    // borderWidth: 1,
    // borderColor: "#3f9eeb",
    // borderRadius: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#3f9eeb",
    padding: 5,
    //paddingVertical: 6,
    paddingHorizontal: 5,
    marginLeft: 15,
    width: 80, // Set a fixed width for the input field
    //backgroundColor: "yellow",
  },
  applyBtnContainer: {
    //flexDirection: "row",
    //width: "100%",
    justifyContent: "center",
    //alignContent: "center",
    alignItems: "center",
    //backgroundColor: "red",
  },
  courseNumApplyBtn: {
    fontSize: 15,
    fontWeight: "700",
    //paddingLeft: 15,
    padding: 10,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "#3f9eeb",
    color: "white",
    //margin: 10,
    width: 100,
    textAlign: "center",
    marginTop: 30,
    //justifyContent: "center",
    //alignItems: "center",
    //justifyContent: "space-between",
    backgroundColor: "#3f9eeb",
    overflow: "hidden",
  },
  clearButton: {
    //backgroundColor: '#3f9eeb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '60%',
  },
  buttonOutline: {
    backgroundColor: "#3f9eeb",
    color: "#3f9eeb",
    borderColor: "#3f9eeb",
    borderWidth: 2,
    marginTop: 50,
  },
  buttonOutlineText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  //applied filters text that shows up next to "Category", "Subject", "Condition"
  selectedOptionText: {
    fontSize: 15,
    color: "grey",
    fontStyle: "italic",
  },
  noResultsFound: {
    fontSize: 25,
    textAlign: "center",
  }
});

