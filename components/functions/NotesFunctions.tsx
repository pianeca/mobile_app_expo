import { supabase } from '@/services/supabase';
import { Task } from '@/types';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

// Add here you're table name, make sure to double check it too
// add you table name here
const tableName = 'appnotes';

export const fetchTask = async (
    setGetTask: (tasks: Task[]) => void, 
    setLoading: (loading: boolean) => void
) => {
    // fetch task: This is were you "Read/Fetch the data from you're database"
    try {
        setLoading(true);
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
            setGetTask(data);
        }
    } catch (error: any) {
        Alert.alert('Error', error.message);
    } finally {
        setLoading(false);
    }
};

export const handleSubmit = async (
    newTitle: string,
    newDesc: string,
    setNewTitle: (title: string) => void,
    setNewDesc: (desc: string) => void,
    setIsAddModalVisible: (visible: boolean) => void,
    setGetTask: (tasks: Task[]) => void,
    setLoading: (loading: boolean) => void
) => {
    // handle sumbit: This is were you "Create" the data to put in you're database
    if (!newTitle.trim()) {
        Alert.alert('Validation', 'Title is required');
        return;
    }

    try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found. Please sign in.');

        const { error } = await supabase
            .from(tableName)
            .insert({
                title: newTitle,
                description: newDesc,
                user_id: user.id
            });

        if (error) throw error;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setNewTitle('');
        setNewDesc('');
        setIsAddModalVisible(false);
        fetchTask(setGetTask, setLoading);

    } catch (error: any) {
        Alert.alert('Error', error.message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
        setLoading(false);
    }
};

export const updateTask = async (
    selectedTask: Task | null,
    updateTitle: string,
    updateDesc: string,
    setIsEditModalVisible: (visible: boolean) => void,
    setSelectedTask: (task: Task | null) => void,
    setGetTask: (tasks: Task[]) => void,
    setLoading: (loading: boolean) => void
) => {
   // update task: This is were you "Update" any changes you apply in the database
    if (!selectedTask) return;

    try {
        setLoading(true);
        const { error } = await supabase
            .from(tableName)
            .update({ 
                title: updateTitle, 
                description: updateDesc 
            })
            .eq('id', selectedTask.id);

        if (error) throw error;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setIsEditModalVisible(false);
        setSelectedTask(null);
        fetchTask(setGetTask, setLoading);

    } catch (error: any) {
        Alert.alert('Error', error.message);
    } finally {
        setLoading(false);
    }
};

export const deleteTask = async (
    id: number,
    setGetTask: (tasks: Task[]) => void,
    setLoading: (loading: boolean) => void
) => {
    // delete task: This is were you "Delete" a notes/task
    try {
        setLoading(true);
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchTask(setGetTask, setLoading);

    } catch (error: any) {
        Alert.alert('Error', error.message);
    } finally {
        setLoading(false);
    }
};