// FIXED AdminNotifications.js - Replace the entire file with this

import React, { useState, useEffect } from 'react';
import { Send, Bell, Users, AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAuthAPI } from '../services/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [n