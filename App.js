import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

const App = () => {
  const [textInput, setTextInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [todos, setTodos] = useState([]);
  const [completedVisible, setCompletedVisible] = useState(false);
  const [completedItems, setCompletedItems] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [noTodosMessage, setNoTodosMessage] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('@todos');
        if (storedTodos !== null) {
          setTodos(JSON.parse(storedTodos));
          setNoTodosMessage(false);
        } else {
          setNoTodosMessage(true);
        }
      } catch (error) {
        console.error('Failed to load todos from AsyncStorage', error);
      }
    };
    loadTodos();
  }, []);

  const loadCompletedItems = async () => {
    try {
      const storedCompletedItems = await AsyncStorage.getItem('@completedItems');
      if (storedCompletedItems !== null) {
        setCompletedItems(JSON.parse(storedCompletedItems));
      }
    } catch (error) {
      console.error('Failed to load completed items from AsyncStorage', error);
    }
  };

  useEffect(() => {
    if (completedVisible) {
      loadCompletedItems();
    }
  }, [completedVisible]);
  
  const saveTodos = async (updatedTodos) => {
    try {
      await AsyncStorage.setItem('@todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Failed to save todos to AsyncStorage', error);
    }
  };

  const saveCompletedItems = async (updatedCompletedItems) => {
    try {
      await AsyncStorage.setItem('@completedItems', JSON.stringify(updatedCompletedItems));
    } catch (error) {
      console.error('Failed to save completed items to AsyncStorage', error);
    }
  };
  
  const handleAddTodo = () => {
    if (textInput.trim() === '') return;
    const newTodo = {
      id: todos.length,
      title: textInput,
      timestamp: new Date().toLocaleString(),
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setTextInput('');
    setNoTodosMessage(false);
  };
  
  const handleDeleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    const todoToDelete = todos.find((todo) => todo.id === id);
    const completedTimestamp = new Date().toLocaleString();
    const updatedCompletedItems = [...completedItems, { ...todoToDelete, completedTimestamp }];
    setTodos(updatedTodos);
    setCompletedItems(updatedCompletedItems);
    saveTodos(updatedTodos);
    saveCompletedItems(updatedCompletedItems);
  };

  const handleDeleteAllTodos = () => {
    setTodos([]);
    saveTodos([]);
  };
  
  const handleDeleteCompleted = (id) => {
    const updatedCompletedItems = completedItems.filter((item) => item.id !== id);
    setCompletedItems(updatedCompletedItems);
    saveCompletedItems(updatedCompletedItems);
  };

  const renderCompletedItem = ({ item }) => (
    <View style={styles.todoItem}>
      <View>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteCompleted(item.id)}>
        <Text style={styles.deleteButton}>❌</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <View>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteTodo(item.id)}>
        <Text style={styles.deleteButton}> ✔️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const handleCloseDeleteAllModal = () => {
    setShowDeleteAllModal(false);
  };

  const handleConfirmDeleteAll = () => {
    setCompletedItems([]);
    saveCompletedItems([]);
    setShowDeleteAllModal(false);
  };

  const handleDeleteAllCompleted = () => {
    Alert.alert(
      '전체 삭제',
      '완료된 일정을 모두 삭제하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        { text: '예', onPress: () => confirmDeleteAllCompleted() },
      ],
      { cancelable: false }
    );
  };

  const confirmDeleteAllCompleted = () => {
    setCompletedItems([]);
    saveCompletedItems([]);
  };

  const handleShowCalendarModal = () => {
    setShowCalendar(true);
    setShowMenuModal(false);
  };

  const handleCloseCalendarModal = () => {
    setShowCalendar(false);
  };
  
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    handleCloseCalendarModal();
  };

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {!completedVisible && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>할 일들</Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchText('')}>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="검색"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          </View>

          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="새로운 할 일을 입력하세요"
              value={textInput}
              onChangeText={(text) => setTextInput(text)}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>

          {noTodosMessage && (
            <Text style={styles.noTodosMessage}>할 일이 없습니다. 새로운 일정을 추가하세요!</Text>
          )}

          <FlatList
            data={todos.filter((todo) =>
              todo.title.toLowerCase().includes(searchText.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} 
            ItemSeparatorComponent={renderSeparator}
            ListFooterComponent={renderSeparator}
          />
        </>
      )}

      <Modal
        visible={showDeleteAllModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseDeleteAllModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>전체 삭제 하시겠습니까?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'red' }]}
                onPress={handleCloseDeleteAllModal}>
                <Text style={styles.modalButtonText}>아니오</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'green' }]}
                onPress={handleConfirmDeleteAll}>
                <Text style={styles.modalButtonText}>예</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {completedVisible && (
        <View style={styles.completedPage}>
          <Text style={styles.title}>완료된 일정</Text>
          <FlatList
            data={completedItems.filter((item) =>
              item.title.toLowerCase().includes(searchText.toLowerCase())
            )}
            renderItem={renderCompletedItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={renderSeparator}
            ListFooterComponent={renderSeparator}
          />
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAllCompleted}>
            <Text style={styles.deleteAllButtonText}>전체 삭제</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showMenuModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMenuModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowMenuModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setCompletedVisible(false);
                  setShowMenuModal(false);
                }}>
                <Text style={styles.menuOptionText}>할 일들</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setCompletedVisible(true);
                  setShowMenuModal(false);
                }}>
                <Text style={styles.menuOptionText}>완료된 일정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={handleShowCalendarModal}>
                <Text style={styles.menuOptionText}>캘린더</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseCalendarModal}>
        <TouchableWithoutFeedback onPress={handleCloseCalendarModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: 'blue' } }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenuModal(true)}>
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  menuOptionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop:30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft:30,
  },
  searchButton: {
    padding: 10,
    color:'#3c7ade',
  },
  searchButtonText: {
    color: '#3c7ade',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '40%',
    marginLeft: 30,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#3c7ade',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  todoTitle: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    fontSize: 20,
    color: 'red',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop:7,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 3,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop:15,
  },
  deleteAllButton: {
    backgroundColor: '#fc4c4c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedPage: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  menuOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
