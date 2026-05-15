'use client';

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useState, useEffect } from "react";
import { 
    BarChart3, Calendar, RefreshCw, User, Mail, Phone, Cake, 
    CheckCircle2, AlertTriangle, AlertOctagon, TrendingDown, Check, 
    Edit, X, Frown, Scale, Ruler,
    Users, Shield, Activity, Zap, ArrowUpRight
} from "lucide-react";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

export default function MyProfilePage() {
    const { user, loading, updateProfile, refetch } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        mobile: '',
        dateOfBirth: '',
        gender: ''
    });

    const isProfileIncomplete = user && (!user.dateOfBirth || !user.gender);

    useEffect(() => {
        if (user && (!user.createdAt || !user.updatedAt)) {
            refetch();
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            let dobValue = '';
            if (user.dateOfBirth) {
                try {
                    const date = new Date(user.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        dobValue = `${year}-${month}-${day}`;
                    }
                } catch (error) {
                    console.error('Error formatting date:', error);
                }
            }
            setFormData({
                dateOfBirth: dobValue,
                gender: user.gender || ''
            });
        }
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-screen bg-white">
                    <LoadingSpinner size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-center space-y-10 animate-fadeIn">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                            <Frown size={48} strokeWidth={3} />
                        </div>
                        <div className="space-y-4">
                             <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground">System Error</h2>
                             <p className="text-muted-foreground font-medium text-lg">Unable to load your profile data.</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'Invalid';
        }
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { 
            text: 'Underweight', 
            color: 'bg-blue-500',
            textColor: 'text-white'
        };
        if (bmi < 25) return { 
            text: 'Normal', 
            color: 'bg-emerald-500',
            textColor: 'text-white'
        };
        if (bmi < 30) return { 
            text: 'Overweight', 
            color: 'bg-amber-500',
            textColor: 'text-white'
        };
        return { 
            text: 'Obese', 
            color: 'bg-red-500',
            textColor: 'text-white'
        };
    };

    const bmiHistory = user.bmiHistory?.length > 0 
        ? user.bmiHistory 
        : (user.healthHistory?.filter(h => h.bmi) || []);

    const getInitials = () => {
        if (user.name) {
            const parts = user.name.split(' ');
            if (parts.length > 1) {
                return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
            }
            return user.name.slice(0, 2).toUpperCase();
        }
        return user.username?.slice(0, 2).toUpperCase() || '??';
    };

    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleEditProfile = () => {
        let dobValue = '';
        if (user.dateOfBirth) {
            try {
                const date = new Date(user.dateOfBirth);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    dobValue = `${year}-${month}-${day}`;
                }
            } catch (error) {
                console.error('Error formatting date:', error);
            }
        }
        setFormData({
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            mobile: user.mobile || '',
            dateOfBirth: dobValue,
            gender: user.gender || ''
        });
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        setEditLoading(true);
        try {
            await updateProfile({
                name: formData.name,
                username: formData.username,
                email: formData.email,
                mobile: formData.mobile,
                dateOfBirth: formData.dateOfBirth || null,
                gender: formData.gender
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20">
                
                {/* Incomplete Profile Banner - Flat Amber Block */}
                {isProfileIncomplete && !isEditing && (
                    <div className="bg-amber-500 text-white rounded-lg p-6 border-b-8 border-amber-600 flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertTriangle size={28} strokeWidth={3} className="animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold uppercase tracking-tight leading-none">Incomplete Profile</h3>
                                <p className="text-white/80 font-medium text-sm">Add age & gender details to enable health analysis.</p>
                            </div>
                        </div>
                        <Button
                            id="btn-complete-profile"
                            onClick={() => {
                                setActiveTab('account');
                                handleEditProfile();
                            }}
                            className="bg-white text-amber-600 hover:bg-amber-50 border-none h-14 px-8"
                        >
                            Update Profile
                        </Button>
                    </div>
                )}

                {/* Hero Profile Section - Poster Style */}
                <section className="bg-foreground text-white rounded-lg overflow-hidden relative">
                    {/* Geometric Overlays */}
                    <div className="absolute inset-0 geometric-bg opacity-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-20 rounded-full -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-secondary opacity-20 rotate-45 -ml-24 -mb-24" />
                    
                    <div className="relative z-10 p-10 md:p-14">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            {/* Avatar - Bold Circular Frame */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center text-4xl md:text-6xl font-black text-foreground border-8 border-white/20 relative overflow-hidden group">
                                    <span className="relative z-10">
                                        {getInitials()}
                                    </span>
                                </div>
                                <div className="absolute bottom-1 right-1 w-12 h-12 bg-emerald-500 rounded-full border-4 border-foreground flex items-center justify-center">
                                    <Shield size={24} strokeWidth={3} />
                                </div>
                            </div>

                            {/* User Primary Identity */}
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-center md:justify-start">
                                        <Badge variant="secondary">User Profile</Badge>
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
                                        {user.name.split(' ')[0]} <br />
                                        <span className="text-white/40">{user.name.split(' ').slice(1).join(' ')}</span>
                                    </h1>
                                    <p className="text-lg text-white/50 font-bold uppercase tracking-[0.3em]">
                                       ID: {user.username || 'USER_001'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <div className="px-5 py-2.5 bg-white/10 rounded-md border-2 border-white/10 flex items-center gap-2">
                                        <Mail size={16} strokeWidth={3} className="text-accent" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{user.email}</span>
                                    </div>
                                    <div className="px-5 py-2.5 bg-white/10 rounded-md border-2 border-white/10 flex items-center gap-2">
                                        <Phone size={16} strokeWidth={3} className="text-accent-secondary" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{user.mobile}</span>
                                    </div>
                                    {user.dateOfBirth && (
                                        <div className="px-5 py-2.5 bg-white/10 rounded-md border-2 border-white/10 flex items-center gap-2">
                                            <Cake size={16} strokeWidth={3} className="text-amber-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{calculateAge(user.dateOfBirth)} YEARS</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tab Navigation - Solid Block Pattern */}
                <div className="flex flex-wrap gap-4">
                    {[
                        { id: 'overview', icon: <Activity size={20} strokeWidth={3} />, label: 'Profile Info' },
                        { id: 'bmi history', icon: <BarChart3 size={20} strokeWidth={3} />, label: 'Health History' },
                        { id: 'account', icon: <Shield size={20} strokeWidth={3} />, label: 'Account Settings' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id.replace(/\s+/g, '-')}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-md font-bold text-xs uppercase tracking-[0.25em] transition-all duration-200 border-2 ${
                                activeTab === tab.id
                                    ? 'bg-foreground text-white border-foreground'
                                    : 'bg-white text-muted-foreground border-muted hover:border-accent hover:text-accent'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Metrics Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fadeIn">
                        <StatCard
                            icon={<Activity size={32} strokeWidth={3} className="text-white" />}
                            label="Health Logs"
                            value={bmiHistory.length}
                            sub="TOTAL RECORDS"
                            color="bg-blue-500"
                        />
                        <StatCard
                            icon={<Calendar size={32} strokeWidth={3} className="text-white" />}
                            label="Joined Date"
                            value={user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                            sub="CREATION DATE"
                            color="bg-violet-500"
                        />
                        <StatCard
                            icon={<RefreshCw size={32} strokeWidth={3} className="text-white" />}
                            label="Last Update"
                            value={user.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                            sub="RECENT MODIFIED"
                            color="bg-emerald-500"
                        />
                        <StatCard
                            icon={<Zap size={32} strokeWidth={3} className="text-white" />}
                            label="Member For"
                            value={user.createdAt ? `${Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} DAYS` : 'N/A'}
                            sub="SINCE JOINING"
                            color="bg-amber-500"
                        />
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'bmi history' && (
                    <div className="space-y-10 animate-fadeIn">
                        {bmiHistory.length > 0 ? (
                            <div className="bg-white border-4 border-muted rounded-lg p-8 md:p-12">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b-4 border-muted pb-8">
                                    <div className="space-y-3 text-center md:text-left">
                                        <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-foreground">Weight History</h2>
                                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em]">Historical progress over time</p>
                                    </div>
                                    <div className="bg-foreground text-white px-6 py-3 rounded-md font-black text-lg tracking-tighter">
                                        {bmiHistory.length} ENTRIES
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-4 border-muted">
                                                <th className="px-6 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Date</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Index</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Weight (kg)</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Height (cm)</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-muted">
                                            {[...bmiHistory].reverse().map((record, index) => {
                                                const category = getBMICategory(record.bmi);
                                                return (
                                                    <tr key={index} className="group hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-6">
                                                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">{formatDate(record.date || record.createdAt)}</p>
                                                        </td>
                                                        <td className="px-4 py-6">
                                                            <p className="text-3xl font-black text-foreground tracking-tighter">{record.bmi?.toFixed(1) || '0.0'}</p>
                                                        </td>
                                                        <td className="px-4 py-6">
                                                            <p className="text-base font-bold text-foreground tracking-tight">{record.weight || '0'} <span className="text-[10px] text-muted-foreground uppercase font-black ml-1">kg</span></p>
                                                        </td>
                                                        <td className="px-4 py-6">
                                                            <p className="text-base font-bold text-foreground tracking-tight">{record.height || '0'} <span className="text-[10px] text-muted-foreground uppercase font-black ml-1">cm</span></p>
                                                        </td>
                                                        <td className="px-4 py-6">
                                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest ${category.color} ${category.textColor}`}>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                                {record.category || category.text}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-muted rounded-lg p-20 text-center space-y-10 border-4 border-dashed border-border max-w-3xl mx-auto">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                                    <BarChart3 size={48} strokeWidth={3} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground">No History</h2>
                                    <p className="text-muted-foreground font-medium text-lg leading-snug">No health history data has been recorded for your profile.</p>
                                </div>
                                <Button
                                    onClick={() => router.push('/bmi')}
                                    className="h-20 px-12 text-xl"
                                >
                                    Add Initial Entry
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                        {/* Identity Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-10 animate-fadeIn">
                                {/* Edit Form - Solid Block Overlay */}
                                {isEditing && (
                                    <div className="bg-white border-4 border-accent rounded-lg p-8 md:p-12 relative overflow-hidden">
                                        <div className="absolute inset-0 geometric-bg opacity-5 pointer-events-none" />
                                        
                                        <div className="relative z-10 flex items-center justify-between mb-10">
                                            <div className="space-y-2">
                                                <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-foreground">Edit Account</h2>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Modify your account details</p>
                                            </div>
                                    <button
                                        id="btn-close-edit"
                                        onClick={() => setIsEditing(false)}
                                        className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-foreground hover:bg-red-500 hover:text-white transition-all duration-200"
                                    >
                                        <X size={28} strokeWidth={3} />
                                    </button>
                                </div>

                                <div className="relative z-10 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <Input
                                            id="input-name"
                                            label="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your Name"
                                            icon={<User size={24} strokeWidth={3} />}
                                        />
                                        <Input
                                            id="input-username"
                                            label="Username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="username"
                                            icon={<Shield size={24} strokeWidth={3} />}
                                        />
                                        <Input
                                            id="input-email"
                                            label="Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                            icon={<Mail size={24} strokeWidth={3} />}
                                        />
                                        <Input
                                            id="input-mobile"
                                            label="Phone Number"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="Your Phone"
                                            icon={<Phone size={24} strokeWidth={3} />}
                                        />
                                        <Input
                                            id="input-dob"
                                            type="date"
                                            label="Date of Birth"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            icon={<Calendar size={24} strokeWidth={3} />}
                                        />
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Gender</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['male', 'female', 'other'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setFormData({ ...formData, gender: opt })}
                                                        className={`h-16 rounded-md font-black text-[10px] uppercase tracking-widest border-4 transition-all duration-200 ${
                                                            formData.gender === opt 
                                                                ? 'bg-foreground text-white border-foreground' 
                                                                : 'bg-white text-muted-foreground border-muted hover:border-accent'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                            <div className="flex gap-4 pt-8 border-t-4 border-muted">
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    loading={editLoading}
                                                    className="flex-1 h-16 text-lg"
                                                >
                                                    Update Profile
                                                    <Check size={24} strokeWidth={3} className="ml-3" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setIsEditing(false)}
                                                    className="h-16 px-10 text-base"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                </div>
                            </div>
                        )}

                                {/* Detail Grid - High Contrast */}
                                <div className="bg-white border-4 border-muted rounded-lg p-8 md:p-12 relative overflow-hidden">
                                    <div className="absolute inset-0 geometric-bg opacity-5 pointer-events-none" />
                                    
                                    <div className="relative z-10 flex items-center justify-between mb-12 border-b-4 border-muted pb-8">
                                        <div className="space-y-3">
                                            <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-foreground">Personal Information</h2>
                                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em]">Account and profile details</p>
                                        </div>
                                        {!isEditing && (
                                            <Button
                                                onClick={handleEditProfile}
                                                variant="secondary"
                                                className="h-12 px-6 text-[10px] uppercase tracking-[0.2em]"
                                            >
                                                Edit Profile
                                                <Edit size={14} strokeWidth={3} className="ml-2" />
                                            </Button>
                                        )}
                                    </div>
                            
                             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <InfoBlock icon={<User size={24} strokeWidth={3} />} label="Full Name" value={user.name} />
                                <InfoBlock icon={<Shield size={24} strokeWidth={3} />} label="Username" value={user.username} mono />
                                <InfoBlock icon={<Mail size={24} strokeWidth={3} />} label="Email" value={user.email} />
                                <InfoBlock icon={<Phone size={24} strokeWidth={3} />} label="Mobile" value={user.mobile} />
                                <InfoBlock 
                                    icon={<Cake size={24} strokeWidth={3} />} 
                                    label="Birth Date" 
                                    value={user.dateOfBirth ? formatDate(user.dateOfBirth) : 'UNDEFINED'} 
                                    warning={!user.dateOfBirth}
                                />
                                <InfoBlock 
                                    icon={<Users size={24} strokeWidth={3} />} 
                                    label="Gender" 
                                    value={user.gender ? user.gender.toUpperCase() : 'UNDEFINED'} 
                                    warning={!user.gender}
                                />
                            </div>

                            <div className="relative z-10 mt-12 pt-12 border-t-4 border-muted grid md:grid-cols-2 gap-8">
                                <div className="flex items-center gap-5 p-6 bg-muted rounded-lg border-2 border-border">
                                    <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-muted-foreground border-2 border-border">
                                        <Calendar size={24} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Account Created</p>
                                        <p className="text-base font-bold text-foreground uppercase tracking-tight">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-6 bg-muted rounded-lg border-2 border-border">
                                    <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-muted-foreground border-2 border-border">
                                        <RefreshCw size={24} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Account Updated</p>
                                        <p className="text-base font-bold text-foreground uppercase tracking-tight">{formatDate(user.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className={`${color} rounded-lg p-8 space-y-4 relative overflow-hidden group transition-transform duration-200 hover:scale-105`}>
            <div className="absolute inset-0 geometric-bg opacity-10 pointer-events-none" />
            <div className="relative z-10 w-12 h-12 bg-white/20 rounded-md flex items-center justify-center border-2 border-white/20">
                {icon}
            </div>
            <div className="relative z-10 space-y-1">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">{label}</p>
                <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">{sub}</p>
            </div>
        </div>
    );
}

function InfoBlock({ icon, label, value, mono = false, warning = false }) {
    return (
        <div className={`p-6 bg-muted rounded-lg border-2 transition-all duration-200 group ${warning ? 'border-amber-500 bg-amber-50' : 'border-border hover:border-accent'}`}>
            <div className="flex flex-col gap-5">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 border-2 transition-all duration-200 ${
                    warning ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-border text-muted-foreground group-hover:text-accent group-hover:border-accent'
                }`}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">{label}</p>
                    <p className={`text-lg font-black truncate uppercase tracking-tight ${
                        warning ? 'text-amber-700' : 'text-foreground'
                    } ${mono ? 'font-mono' : ''}`}>
                        {value || 'UNDEFINED'}
                    </p>
                </div>
            </div>
        </div>
    );
}
