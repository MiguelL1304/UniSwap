import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Button,
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDB } from "../../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import HomeHeader from "../Components/HomeHeader";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import BottomSheet, { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import "react-native-gesture-handler";


//default img if no img posted with listing
import defaultImg from "../../assets/defaultImg.png";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";


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
  const snapPoints = useMemo(() => ["50", "90%"], []);


  //
  //
  // Filter Logic
  //
  //


  const [filters, setFilters] = useState({
    category: [],
    condition: [],
    subject: [],
    course: [],
  });

  const [filtersHistory, setFiltersHistory] = useState([]);

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

  function compareStrings(str1, str2) {
    const distance = levenshteinDistance(str1, str2);
    return distance;
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
    const newStack = [...filterStack];
    newStack.pop();
    setFilterStack(newStack);
  }

  const renderBottomSheetContent = () => {
    const currentFilter = filterStack[filterStack.length - 1];

    switch (currentFilter) {
      case "main":
        return <FilterContent onSelectFilter={onSelectFilter} />;
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
      default:
        return <FilterContent onSelectFilter={onSelectFilter} />;  
    }
  }

  function handlePresentModal() {
    bottomSheetModalRef.current?.present();
  }

  function handleSearch() {
    if(searchQuery.trim() !== "") {
      const userInput = searchQuery;
      const searchResults = searchListings(userInput, listingTitles, originalListings);
      const sortedResults = sortSearchResults(searchResults, userInput);

      // Update the listings state with the search results
      setListings(sortedResults);
      Keyboard.dismiss();
    }
  }

  function handleClear() {
    setSearchQuery("");
    setListings(originalListings);
    Keyboard.dismiss();
  }

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestoreDB, "listing"));
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
       }));

      setOriginalListings(documents);

      const transformedTitles = transformListingTitles(originalListings);
      setListingTitles(transformedTitles)
          
      const filteredListings = filterListings(documents, filters); // Apply filtering
      setListings(filteredListings);
      

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
    if (filtersHistory.length > 0) {
      const anyFilterRemoved = Object.keys(filters).some((category) => {
        const currentFilterLength = filters[category].length;
        console.log("currentFilterLength");
        console.log(currentFilterLength);
        const previousFilterLength = filtersHistory[filtersHistory.length - 1][category].length;
        console.log("previousFilterLength");
        console.log(previousFilterLength);
        console.log("-----------");
        return currentFilterLength < previousFilterLength;
      });

      if (anyFilterRemoved) {
        setListings(originalListings);
      } else {
        const filteredListings = filterListings(originalListings, filters);
        setListings(filteredListings);
      }
    }
  }, [filters]);

  const handleListing = (listing) => {
    navigation.navigate("Listing", { listing: listing });
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
      />

      {/* // display  of listings */}
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
const FilterOption = ({ title, onPress}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.filterOption}>{title}</Text>
  </TouchableOpacity>
);

const FilterContent = ({ onSelectFilter }) => (
  <View style={styles.filterContent}>
    <FilterOption title="Category" onPress={() => onSelectFilter("Category")} />
    {/* <Ionicons name="chevron-forward" /> */}
    <FilterOption title="Subject" onPress={() => onSelectFilter("Subject")}/>
    <FilterOption title="Condition" onPress={() => onSelectFilter("Condition")}/>
  </View>
)

const CategoryContent = ({ onBack, selectedCategories, addCategory }) => (
  <ScrollView style={styles.scrollViewContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
    </TouchableOpacity>
    
    {/* CATEGORIES */}
    <TouchableOpacity style={styles.subjectBox} onPress={() => addCategory("Books")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedCategories.includes("Books") && { color: "red" }
        ]}>Books</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addCategory("Clothes")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedCategories.includes("Clothes") && { color: "red" }
        ]}>Clothes</Text>
    </TouchableOpacity>
  </ScrollView>
)

const SubjectContent = ({ onBack, selectedSubjects, addSubject }) => (
  <ScrollView style={styles.scrollViewContainer}>

    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
    </TouchableOpacity>

    {/* SUBJECTS */}
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Accounting")}>
      <Text style={styles.filterSubjectOptions}>Accounting</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("African American Studies")}>
      <Text style={styles.filterSubjectOptions}>African American Studies</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Anthropology")}>
      <Text style={styles.filterSubjectOptions}>Anthropology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Art")}>
      <Text style={styles.filterSubjectOptions}>Art</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Biochemistry")}>
      <Text style={styles.filterSubjectOptions}>Biochemistry</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Biology")}>
      <Text style={styles.filterSubjectOptions}>Biology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Business Administration")}>
      <Text style={styles.filterSubjectOptions}>Business Administration</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Chemistry")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedSubjects.includes("Chemistry") && { color: "red" }
        ]}>Chemistry</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Cinema Media")}>
      <Text style={styles.filterSubjectOptions}>Cinema Media</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Communications")}>
      <Text style={styles.filterSubjectOptions}>Communications</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Computer Science")}>
      <Text style={styles.filterSubjectOptions}>Computer Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Economics")}>
      <Text style={styles.filterSubjectOptions}>Economics</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Education")}>
      <Text style={styles.filterSubjectOptions}>Education</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("English")}>
      <Text style={styles.filterSubjectOptions}>English</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Environmental Science")}>
      <Text style={styles.filterSubjectOptions}>Environmental Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Film")}>
      <Text style={styles.filterSubjectOptions}>Film</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Finance")}>
      <Text style={styles.filterSubjectOptions}>Finance</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("French")}>
      <Text style={styles.filterSubjectOptions}>French</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Geography")}>
      <Text style={styles.filterSubjectOptions}>Geography</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Health Science")}>
      <Text style={styles.filterSubjectOptions}>Health Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Honors")}>
      <Text style={styles.filterSubjectOptions}>Honors</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Human Services")}>
      <Text style={styles.filterSubjectOptions}>Human Services</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Information Technology")}>
      <Text style={styles.filterSubjectOptions}>Information Technology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Management")}>
      <Text style={styles.filterSubjectOptions}>Management</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Marketing")}>
      <Text style={styles.filterSubjectOptions}>Marketing</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Mathematics")}>
      <Text style={styles.filterSubjectOptions}>Mathematics</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Music")}>
      <Text style={styles.filterSubjectOptions}>Music</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Nursing")}>
      <Text style={styles.filterSubjectOptions}>Nursing</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Philosophy")}>
      <Text style={styles.filterSubjectOptions}>Philosophy</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Physical Education")}>
      <Text style={styles.filterSubjectOptions}>Physical Education</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Political Science")}>
      <Text style={styles.filterSubjectOptions}>Political Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Psychology")}>
      <Text style={styles.filterSubjectOptions}>Psychology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Sociology")}>
      <Text style={styles.filterSubjectOptions}>Sociology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Spanish")}>
      <Text style={styles.filterSubjectOptions}>Spanish</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox} onPress={() => addSubject("Theatre")}>
      <Text style={styles.filterSubjectOptions}>Theatre</Text>
    </TouchableOpacity>
  </ScrollView>
)

const ConditionContent = ({ onBack, selectedConditions, addCondition }) => (
  <ScrollView style={styles.scrollViewContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back-circle" size={40} color="#3f9eeb"/>
    </TouchableOpacity>
    
    {/* CONDITIONS */}
    <TouchableOpacity style={styles.subjectBox} onPress={() => addCondition("Brand New")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedConditions.includes("Brand New") && { color: "red" }
        ]}>Brand New</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.subjectBox} onPress={() => addCondition("Like New")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedConditions.includes("Like New") && { color: "red" }
        ]}>Like New</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.subjectBox} onPress={() => addCondition("Used - Excellent")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedConditions.includes("Used - Excellent") && { color: "red" }
        ]}>Used - Excellent</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.subjectBox} onPress={() => addCondition("Used - Good")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedConditions.includes("Used - Good") && { color: "red" }
        ]}>Used - Good</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.subjectBox} onPress={() => addCondition("Used - Fair")}>
      <Text style={[
          styles.filterSubjectOptions,
          selectedConditions.includes("Used - Fair") && { color: "red" }
        ]}>Used - Fair</Text>
    </TouchableOpacity>

    
  </ScrollView>
)

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
  filterContent: {
    //backgroundColor: "pink",
    //flexDirection: "row",
    //margin: 2,
  },
  filterOption: {
    flexDirection: "row",
    padding: 20,
    //margin: 40,
    fontSize: 20,
    //backgroundColor: "red",
  },
  backButton: {
    //padding: 10,
    //backgroundColor: "red",
    //flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: 15,
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
  }
});

